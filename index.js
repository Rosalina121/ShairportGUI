// import the module
let ShairportReader = require("shairport-sync-reader");
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const vibrant = require("node-vibrant");
const fs = require("fs");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "192.168.1.181:3000", // change this to your local ip
        methods: ["GET,POST"],
        credentials: true,
        transports: ["websocket", "polling"]
    },
    allowEIO3: true
});

const saveBase64ImageToDisk = (data, fileName) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, data, "base64", (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(fileName);
            }
        });
    });
};

const emitPalette = (image) => {
    palette = vibrant.from(image).getPalette((err, palette) => {
        // TODO: Add actual error handling
        if (!err) {
            console.log('no error?');
            console.log(palette);
            console.log(err);
            let paletteObj = {
                borderColor: palette.Vibrant.rgb,
                tlShadowColor: palette.DarkVibrant.rgb,
                songColor: palette.LightVibrant.rgb,
                brShadowColor: palette.DarkMuted.rgb,
                artistColor: palette.LightMuted.rgb
            };
            console.log(paletteObj);
            io.emit("palette", paletteObj);
        } else {
            console.log(err);
        }
    });
};

const removeBrackets = (str) => {
    str = str.replace(/\[[^]*\]/, "");
    return str.replace(/\([^]*\)/, "");
};

// read from pipe
var pipeReader = new ShairportReader({ path: "/tmp/shairport-sync-metadata" }); // your metadata pipe path

// listen for metadata
pipeReader.on("meta", function (metadata) {
    console.log("got meta: ");
    // parse metadata
    let title = metadata.minm;
    let artist = metadata.asar;
    let album = metadata.asal;
    title = removeBrackets(title); // get rid of brackets coz text is too long
    album = removeBrackets(album); // same
    console.log(title + " - " + artist + " - " + album);
    io.emit("metadata", { title, artist, album });
});

pipeReader.on("PICT", function (pictureData) {
    console.log(pictureData);
    // pirctureData to base64
    let base64 = Buffer.from(pictureData).toString("base64");
    // save to disk and emit palette
    try {
        saveBase64ImageToDisk(base64, "./image.png").then((fileName) => {
            console.log(fileName);
            // get palette
            emitPalette(fileName);
        });
        io.emit("pictureData", base64);
    } catch (err) {
        console.log(err);
    }
    
});

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

server.listen(3000, () => {
    console.log("listening on *:3000");
});
