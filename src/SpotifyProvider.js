const SpotifyWebApi = require("spotify-web-api-node");
const util = require("util");
const SongProvider = require("./SongProvider");
const { emitSongCover, emitSongMeta } = require("./utils");
var request = require("request").defaults({ encoding: null });

class SpotifyProvider extends SongProvider {
    scopes = ["user-read-currently-playing"];
    redirectUri = "http://localhost:3000/callback";
    clientId = process.env.SPOTIFY_ID;
    state = "some-state-of-my-choice";

    spotifyApi = new SpotifyWebApi({
        clientId: this.clientId,
        clientSecret: process.env.SPOTIFY_SECRET,
        redirectUri: this.redirectUri
    });

    authorizeURL = this.spotifyApi.createAuthorizeURL(this.scopes, this.state);

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
                if (
                    track.body &&
                    track.body.item &&
                    track.body.item.id !== currentSong
                ) {
                    currentSong = track.body.item.id;
                    emitSongMeta(
                        track.body.item.name,
                        track.body.item.artists[0]?.name ?? "",
                        track.body.item?.album?.name ?? ""
                    );

                    // picture
                    const url = track.body.item?.album.images[0].url;
                    const imageRes = await util.promisify(request.get)(url);
                    emitSongCover(imageRes.body);
                }
            } catch (err) {
                console.log(err);
            }
        }, 1000);
    }
}

module.exports = SpotifyProvider;
