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
    // bgImg.style.backgroundImage = `url(data:image/png;base64,${pictureData})`
    // console.log('background picture set!')
});

socket.on("palette", (palette) => {
    console.log("palette get!");
    applyPallette(palette);
    console.log("palette set!");
});
