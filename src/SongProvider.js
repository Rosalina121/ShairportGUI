export default class SongProvider {
    get isUsingOauth() {
        return false;
    }

    get authorizeURL() {
        return null;
    }

    get isLoggedIn() {
        return true;
    }

    async onOauthCallback(_req, _res) {
        return;
    }
}
