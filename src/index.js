// import the module
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

const SpotifyProvider = require("./SpotifyProvider");
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

function selectProvider(providerName) {
    switch (providerName) {
        case "spotify":
            return new SpotifyProvider();
        default:
            return new ShairportProvider("/tmp/shairport-sync-metadata"); // your metadata pipe path
    }
}

const songProvider = selectProvider(process.env.SONG_PROVIDER);

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
