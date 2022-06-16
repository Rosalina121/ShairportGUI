let r = document.querySelector(":root");

let backgroundType = "image";
const imgContainer = document.querySelector(".background-img");

let internalPalette = {};

const applyPallette = (palette) => {
    internalPalette = palette;
    console.log(internalPalette);
    for (color in palette) {
        r.style.setProperty(`--${color}`, "rgb(" + palette[color] + ")");
        console.log(`${color}: rgb(${palette[color]})`);
        r.style.setProperty(`--${color}Raw`, palette[color]);
        console.log(`${color}Raw: ${palette[color]}`);
    }
};

const processTypes = (backgroundType) => {
    switch (backgroundType) {
        case "image":
            setBackgroundImage();
            break;
        case "blur":
            setBackgroundBlur();
            break;
        case "fancy":
            setBackgroundFancy();
            break;
        default:
            setBackgroundImage();
            break;
    }
};

const onInit = () => {
    backgroundType = getBackgroundType();
    processTypes(backgroundType);
};

const changeStyle = (backgroundTypeVar) => {
    resetStyle();
    processTypes(backgroundTypeVar);
    saveBackgroundType(backgroundTypeVar);
    backgroundType = backgroundTypeVar;
};

// toggle background styles between image, blur and blurHash
const toggleBackgroundType = () => {
    const backgroundType = getBackgroundType();
    if (backgroundType === "image") {
        changeStyle("blur");
        console.log("background type set to blur");
    } else if (backgroundType === "blur") {
        changeStyle("fancy");
        console.log("background type set to fancy");
    } else if (backgroundType === "fancy") {
        changeStyle("image");
        console.log("background type set to image");
    }
};

const resetStyle = () => {
    document.querySelector(".background-img").style.removeProperty("display");
    document.querySelector(".orb-canvas").style.display = "none";
    imgContainer.style.removeProperty("background-image");
    imgContainer.style.removeProperty("filter");
    imgContainer.style.removeProperty("animation");
};

const setBackgroundImage = () => {
    imgContainer.style.backgroundImage = `url(${
        document.querySelector("#cover").src
    })`;
    imgContainer.style["filter"] = "blur(70px)";
};

const setBackgroundFancy = () => {
    document.querySelector(".orb-canvas").style.removeProperty("display");
    document.querySelector(".background-img").style.display = "none";
    // I shouldn't have done that but it works
    // also, should add handling if fancy has been already set
    import("./fancyBlur.js")
        .then(({ startFancyBlur }) => {
            startFancyBlur();
        })
        .catch((error) => {
            console.error(error);
        });
};

const setBackgroundBlur = () => {
    imgContainer.style.backgroundImage = `radial-gradient(circle at left,
        rgba(var(--borderColorRaw), 1),
        rgba(255, 255, 255, 0) 50%),
      radial-gradient(circle at top left,
        rgba(var(--artistColorRaw), 0.4),
        rgba(255, 255, 255, 0) 60%),
      radial-gradient(circle at bottom,
        rgba(var(--songColorRaw), 0.3),
        rgba(255, 255, 255, 0) 60%),
      radial-gradient(circle at top right,
        rgba(var(--tlShadowColorRaw), 1),
        rgba(255, 255, 255, 0) 60%),
      radial-gradient(circle at bottom right,
        rgba(var(--brShadowColorRaw), 1),
        rgba(255, 255, 255, 0) 60%)`;
    // imgContainer.style.filter = "brightness(0.8)";
};

// get background type (either image, blur or blurHash) from browser local storage
const getBackgroundType = () => {
    let backgroundType = localStorage.getItem("backgroundType");
    if (backgroundType === null) {
        backgroundType = "image";
    }
    return backgroundType;
};

// save current backgroundType to browser local storage
const saveBackgroundType = (backgroundType) => {
    localStorage.setItem("backgroundType", backgroundType);
};

const updateBackground = (backgroundType, pictureData) => {
    switch (backgroundType) {
        case "image":
            updateBackgroundImage(pictureData);
            break;
        default:
            // basically blur, do nothing as blur uses palette colors
            // fancy too
            // this can be an if statement,
            // but I'm leaving this in case I want to add more background types
            break;
    }
};

const updateBackgroundImage = (pictureData) => {
    imgContainer.style.backgroundImage = `url(data:image/png;base64,${pictureData})`;
    // fot initial load
    if (imgContainer.style.filter === "") {
        imgContainer.style.filter = "blur(70px)";
    }
    console.log("background picture set!");
};

const updateBackgroundFancy = () => {
    // I shouldn't have done that but it works
    import("./fancyBlur.js")
        .then(({ updateColors }) => {
            updateColors(internalPalette);
        })
        .catch((error) => {
            console.error(error);
        });
};

let socket = io();
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
    img.src = `data:image/png;base64,` + pictureData;
    console.log("cover picture set!");
    updateBackground(backgroundType, pictureData);
});

socket.on("palette", (palette) => {
    console.log("palette get!");
    applyPallette(palette);
    if (backgroundType === "fancy") {
        updateBackgroundFancy();
    }
    console.log("palette set!");
});

document.addEventListener("DOMContentLoaded", onInit, false);
console.log("scripts loaded!");
