// import the module
let ShairportReader = require("shairport-sync-reader");
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const vibrant = require("node-vibrant");

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

const vibrantTest = (image) => {
    palette = vibrant.from(image).getPalette((err, palette) => {
        // console.log(palette.Vibrant.hex);
        // console.log(palette.DarkVibrant.hex);
        // console.log(palette.LightVibrant.hex);
        // console.log(palette.DarkMuted.hex);
        console.log(palette.LightMuted.hex);
        let paletteObj = {
            songColor: palette.Vibrant.hex,
            tlShadow: palette.DarkVibrant.hex,
            borderColor: palette.LightVibrant.hex,
            brShadow: palette.DarkMuted.hex,
            artistColor: palette.LightMuted.hex,
        };
        // console.log(paletteObj);
        io.emit("palette", paletteObj);
    });

    io.emit("palette", palette);
}

vibrantTest("https://test.palitechnika.com/rosa.png");

// // read from pipe
// var pipeReader = new ShairportReader({ path: '/tmp/shairport-sync-metadata' });

// // listen for metadata
// pipeReader.on("meta", function (metadata) {
//     console.log('got meta: ');
//     // parse metadata
//     let title = metadata.minm;
//     let artist = metadata.asar;
//     let album = metadata.asal;
//     console.log(title + " - " + artist + " - " + album);
//     io.emit("metadata", {title, artist, album});
// });

// pipeReader.on("PICT", function(pictureData) {
//     console.log(pictureData);
//     // pirctureData to base64
//     let base64 = Buffer.from(pictureData).toString('base64');
//     io.emit("pictureData", base64);
// })

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
