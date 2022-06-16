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

const emitPalette = (io, image) => {
    vibrant.from(image).getPalette((err, palette) => {
        // TODO: Add actual error handling
        if (!err) {
            console.log("no error?");
            console.log(palette);
            console.log(err);
            let paletteObj = {
                borderColor: palette.Vibrant.rgb,
                tlShadowColor: palette.DarkVibrant.rgb,
                songColor: palette.LightVibrant.rgb,
                brShadowColor: palette.DarkMuted.rgb,
                artistColor: palette.LightMuted.rgb
            };
            console.log(paletteObj);
            io.emit("palette", paletteObj);
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
            console.log(fileName);
            // get palette
            emitPalette(io, fileName);
        });
        io.emit("pictureData", base64);
    } catch (err) {
        console.log(err);
    }
}
