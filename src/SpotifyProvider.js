import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";
import SongProvider from "./SongProvider";
import {
    emitSongCover,
    emitSongMeta,
    emitSongProgress,
    emitSongPlaying
} from "./utils";

export default class SpotifyProvider extends SongProvider {
    constructor(io) {
        super();
        this.io = io;
    }
    scopes = ["user-read-currently-playing"];
    redirectUri = process.env.REDIRECT_URI ?? "http://localhost:3000/callback";
    clientId = process.env.SPOTIFY_ID;
    state = "some-state-of-my-choice";

    spotifyApi = new SpotifyWebApi({
        clientId: this.clientId,
        clientSecret: process.env.SPOTIFY_SECRET,
        redirectUri: this.redirectUri
    });

    get authorizeURL() {
        return this.spotifyApi.createAuthorizeURL(this.scopes, this.state);
    }

    get isUsingOauth() {
        return true;
    }

    get isLoggedIn() {
        return !!this.spotifyApi.getAccessToken();
    }

    async onOauthCallback(req, res) {
        const data = await this.spotifyApi.authorizationCodeGrant(
            req.query.code
        );
        this.spotifyApi.setAccessToken(data.body["access_token"]);
        this.spotifyApi.setRefreshToken(data.body["refresh_token"]);

        res.redirect("/");

        let currentSong = null;
        setInterval(async () => {
            try {
                const track = await this.spotifyApi.getMyCurrentPlayingTrack();
                if (track.body) {
                    // is paused?
                    const isPlaying = track.body.is_playing === true;
                    if (isPlaying != null) {
                        emitSongPlaying(this.io, isPlaying);
                    }
                }
                if (
                    track.body &&
                    track.body.item &&
                    track.body.item.id !== currentSong &&
                    track.body.item.type === "track"
                ) {
                    currentSong = track.body.item.id;
                    emitSongMeta(
                        this.io,
                        track.body.item.name,
                        track.body.item.artists[0]?.name ?? "",
                        track.body.item?.album?.name ?? ""
                    );

                    // picture
                    const url = track.body.item?.album.images[0].url;
                    const imageRes = await axios.get(url, {
                        responseType: "arraybuffer"
                    });
                    emitSongCover(this.io, imageRes.data);

                    // duration
                    const duration = track.body?.item.duration_ms ?? 1000;
                    const progress = track.body?.progress_ms ?? 0;
                    const finalDuration = duration - progress;
                    emitSongProgress(this.io, finalDuration / 1000);
                }
            } catch (err) {
                console.log(err);
            }
        }, 1000);
    }
}
