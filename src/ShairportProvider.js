const SongProvider = require("./SongProvider");
const ShairportReader = require("shairport-sync-reader");

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
            let title = metadata.minm;
            let artist = metadata.asar;
            let album = metadata.asal;
            title = removeBrackets(title); // get rid of brackets coz text is too long
            album = removeBrackets(album); // same
            console.log(title + " - " + artist + " - " + album);
            io.emit("metadata", { title, artist, album });
        });

        this.pipeReader.on("PICT", function (pictureData) {
            console.log(pictureData);
            // pirctureData to base64
            let base64 = Buffer.from(pictureData).toString("base64");
            // save to disk and emit palette
            try {
                saveBase64ImageToDisk(base64, "./image.png").then(
                    (fileName) => {
                        console.log(fileName);
                        // get palette
                        emitPalette(fileName);
                    }
                );
                io.emit("pictureData", base64);
            } catch (err) {
                console.log(err);
            }
        });
    }
}

module.exports = ShairportProvider;
