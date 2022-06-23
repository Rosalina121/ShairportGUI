import fs from "fs";
import vibrant from "node-vibrant";

const removeBrackets = (str) => {
    str = str.replace(/\[[^]*\]/, "");
    return str.replace(/\([^]*\)/, "");
};

const saveBase64ImageToDisk = (data, fileName) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, data, "base64", (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(fileName);
            }
        });
    });
};

const checkIfImageIsBrightOrDark = (image) => {
    // check if overall image luminance is bright or not
};

const emitPalette = (io, image) => {
    checkIfImageIsBrightOrDark(image);
    vibrant.from(image).getPalette((err, palette) => {
        // TODO: Add actual error handling
        if (!err) {
            io.emit("palette", palette);
        } else {
            console.error(err);
        }
    });
};

export function emitSongMeta(io, title, artist, album) {
    const newTitle = removeBrackets(title); // get rid of brackets coz text is too long
    const newAlbum = removeBrackets(album); // same
    console.log(newTitle + " - " + artist + " - " + newAlbum);
    io.emit("metadata", { title: newTitle, artist, album: newAlbum });
}

export function emitSongCover(io, pictureData) {
    let base64 = Buffer.from(pictureData).toString("base64");
    // save to disk and emit palette
    try {
        saveBase64ImageToDisk(base64, "./image.png").then((fileName) => {
            // get palette
            emitPalette(io, fileName);
        });
        io.emit("pictureData", base64);
    } catch (err) {
        console.log(err);
    }
}

export function emitSongProgress(io, progress) {
    io.emit("progress", progress);
}
