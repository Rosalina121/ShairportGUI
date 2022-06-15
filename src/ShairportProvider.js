const SongProvider = require("./SongProvider");
const ShairportReader = require("shairport-sync-reader");
const { emitSongMeta, emitSongCover } = require("./utils");

class ShairportProvider extends SongProvider {
    constructor(path) {
        super();
        // read from pipe
        this.pipeReader = new ShairportReader({
            path
        });

        // listen for metadata
        this.pipeReader.on("meta", function (metadata) {
            console.log("got meta: ");
            // parse metadata
            emitSongMeta(metadata.minm, metadata.asar, metadata.asal);
        });

        this.pipeReader.on("PICT", function (pictureData) {
            console.log(pictureData);
            // pirctureData to base64
            emitSongCover(pictureData);
        });
    }
}

module.exports = ShairportProvider;
