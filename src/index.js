// import the module
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

// const ws281x = require("rpi-ws281x-native");

const SpotifyProvider = require("./SpotifyProvider");
const path = require("path");
const ShairportProvider = require("./ShairportProvider");

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
global.io = io;

// ws281x stuff
// const NUM_LEDS = 30;    // change to your LED amount
// const pixelData = new Uint32Array(NUM_LEDS);
// ws281x.init(NUM_LEDS);  // comment to disable LEDs

// const changeStripColor = (color) => {
//     // set LED brightness to max
//     ws281x.setBrightness(255);
//     console.log("brightness set");
//     // set all LEDs to the color
//     for (let i = 0; i < NUM_LEDS; i++) {
//         pixelData[i] = color;
//     }
//     console.log("color set");
//     ws281x.render(pixelData);
// }

function selectProvider(providerName) {
    switch (providerName) {
        case "spotify":
            return new SpotifyProvider();
        default:
            return new ShairportProvider("/tmp/shairport-sync-metadata"); // your metadata pipe path
    }
}

const songProvider = selectProvider(process.argv[2]);

app.get("/", (req, res) => {
    if (!songProvider.isLoggedIn) {
        res.redirect(songProvider.authorizeURL);
    } else {
        res.sendFile(path.join(__dirname, "..", "/public/index.html"));
    }
});

app.get("/callback", async (req, res) => {
    if (songProvider.isUsingOauth) {
        songProvider.onOauthCallback(req, res);
    }
});

console.log("path", path.join(__dirname, "..", "public"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
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
