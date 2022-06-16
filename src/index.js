import SpotifyProvider from "./SpotifyProvider";
import ShairportProvider from "./ShairportProvider";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

require("dotenv").config();
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "192.168.1.181:3000", // change this to your local ip
        methods: ["GET,POST"],
        credentials: true
    },
    allowEIO3: true
});

function selectProvider(providerName) {
    switch (providerName) {
        case "spotify":
            return new SpotifyProvider(io);
        default:
            return new ShairportProvider(io, "/tmp/shairport-sync-metadata"); // your metadata pipe path
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
