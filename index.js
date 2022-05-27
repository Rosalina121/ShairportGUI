// import the module
let ShairportReader = require("shairport-sync-reader");
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const vibrant = require("node-vibrant");
const fs = require("fs")


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "192.168.1.181:3000",
        methods: ["GET,POST"],
        credentials: true,
        transports: ['websocket', 'polling'],
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
        let paletteObj = {
            songColor: palette.Vibrant.hex,
            tlShadow: palette.DarkVibrant.hex,
            borderColor: palette.LightVibrant.hex,
            brShadow: palette.DarkMuted.hex,
            artistColor: palette.LightMuted.hex,
        };
        io.emit("palette", paletteObj);
    });
};

// read from pipe
var pipeReader = new ShairportReader({ path: '/tmp/shairport-sync-metadata' });

// listen for metadata
pipeReader.on("meta", function (metadata) {
    console.log('got meta: ');
    // parse metadata
    let title = metadata.minm;
    let artist = metadata.asar;
    let album = metadata.asal;
    title = title.replace(/\[[^]*\]/,'');
    console.log(shortTitle + " - " + artist + " - " + album);
    io.emit("metadata", {title, artist, album});
});

pipeReader.on("PICT", function(pictureData) {
    console.log(pictureData);
    // pirctureData to base64
    let base64 = Buffer.from(pictureData).toString('base64');
    // save to disk
    saveBase64ImageToDisk(base64, './image.png').then((fileName) => {
        console.log(fileName);
        // get palette
        emitPalette(fileName);
    });
    io.emit("pictureData", base64);
})

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

server.listen(3000, () => {
    console.log("listening on *:3000");
});
