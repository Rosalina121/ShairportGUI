let r = document.querySelector(":root");
const applyPallette = (palette) => {
    for (color in palette) {
        r.style.setProperty(`--${color}`, "rgb(" + palette[color] + ")");
        console.log(`${color}: rgb(${palette[color]})`);
        r.style.setProperty(`--${color}Raw`, palette[color]);
        console.log(`${color}Raw: ${palette[color]}`);
    }

    r.style.setProperty(
        `--brShadowColorForBoxShadow`,
        `${palette.brShadowColor}`
    );
    r.style.setProperty(
        `--tlShadowColorForBoxShadow`,
        `${palette.tlShadowColor}`
    );
};

var socket = io();
socket.on("metadata", (metadata) => {
    let title = document.querySelector("#title");
    let album = document.querySelector("#album");
    let artist = document.querySelector("#artist");
    title.textContent = metadata.title;
    album.textContent = metadata.album;
    artist.textContent = metadata.artist;
    console.log("data get!");
});

socket.on("pictureData", (pictureData) => {
    console.log("picture get!");
    let img = document.querySelector("#cover");
    // let bgImg = document.querySelector(".background-img")[0];
    img.src = `data:image/png;base64,` + pictureData;
    console.log("cover picture set!");
    // comment this to disable blur
    blurImage();
    console.log("blur image set!");
    // bgImg.style.backgroundImage = `url(data:image/png;base64,${pictureData})`
    // console.log('background picture set!')
});

socket.on("palette", (palette) => {
    console.log("palette get!");
    applyPallette(palette);
    console.log("palette set!");
});



// blur image
const blurImage = () => {
    const imgContainer = document.querySelector(".background-img");
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        const imgData = blurhash.getImageData(img);

        blurhash
            .encodePromise(imgData, img.width, img.height, 4, 4)
            .then((hash) => {
                return blurhash.decodePromise(hash, img.width, img.height);
            })
            .then((blurhashImgData) => {
                // as image object with promise
                return blurhash.getImageDataAsImageWithOnloadPromise(
                    blurhashImgData,
                    img.width,
                    img.height
                );
            })
            .then((imgObject) => {
                imgContainer.style.backgroundImage = `url(${imgObject.src})`;
            });
    };
    img.src = document.querySelector("#cover").src;
};
blurImage();