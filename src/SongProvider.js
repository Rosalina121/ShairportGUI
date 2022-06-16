class SongProvider {
    get isUsingOauth() {
        return false;
    }

    get isLoggedIn() {
        return true;
    }

    async onOauthCallback(req, res) {
        return;
    }
}

module.exports = SongProvider;
