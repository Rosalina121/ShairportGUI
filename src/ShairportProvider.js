import SongProvider from "./SongProvider";
import ShairportReader from "shairport-sync-reader";
import { emitSongCover, emitSongMeta, emitSongProgress, emitSongPlaying } from "./utils";

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
        this.pipeReader.on("prgr", function (progress) {
            console.log("Progress: ", progress);
            if (progress && progress.start && progress.end && progress.current) {
                let start = progress.start;
                let end = progress.end;
                let current = progress.current;
                
                if (end < start) end += 4294967296;
                if (current < start) current += 4294967296;

                const duration = (end - start) / 44100;
                const currentTime = (current - start) / 44100;
                emitSongProgress(io, { duration, current: currentTime });
            } else {
                emitSongProgress(io, progress);
            }
        });

        this.pipeReader.on("pbeg", function () {
            console.log("Playback started");
            emitSongPlaying(io, true);
        });

        this.pipeReader.on("pend", function () {
            console.log("Playback ended");
            emitSongPlaying(io, false);
        });
    }
}
