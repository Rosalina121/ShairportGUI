import SongProvider from "./SongProvider";
import ShairportReader from "shairport-sync-reader";
import { emitSongCover, emitSongMeta } from "./utils";

export default class ShairportProvider extends SongProvider {
    constructor(io, path) {
        super();
        // read from pipe
        this.pipeReader = new ShairportReader({
            path
        });

        // listen for metadata
        this.pipeReader.on("meta", function (metadata) {
            console.log("got meta: ");
            // parse metadata
            emitSongMeta(io, metadata.minm, metadata.asar, metadata.asal);
        });

        this.pipeReader.on("PICT", function (pictureData) {
            console.log(pictureData);
            // pirctureData to base64
            emitSongCover(io, pictureData);
        });
    }
}
