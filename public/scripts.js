let r = document.querySelector(":root");

let backgroundType = "image";
const imgContainer = document.querySelector(".background-img");

let internalPalette = {};
let oldFancyColors = {};
let isBright = true; // with placeholder image and other placeholder values it does not matter in init

const applyPallette = (palette) => {
    internalPalette = palette;
    r.style.setProperty(`--borderColorRaw`, palette.Vibrant.rgb);
    if (isBright) {
        r.style.setProperty(`--artistColorRaw`, palette.DarkMuted.rgb);
        r.style.setProperty(`--songColorRaw`, palette.DarkVibrant.rgb);
        r.style.setProperty(`--tlShadowColorRaw`, palette.LightVibrant.rgb);
        r.style.setProperty(`--brShadowColorRaw`, palette.LightMuted.rgb);
    } else {
        r.style.setProperty(`--artistColorRaw`, palette.LightMuted.rgb);
        r.style.setProperty(`--songColorRaw`, palette.LightVibrant.rgb);
        r.style.setProperty(`--tlShadowColorRaw`, palette.DarkVibrant.rgb);
        r.style.setProperty(`--brShadowColorRaw`, palette.DarkMuted.rgb);
    }
};

function getBrightness(imageSrc, callback) {
    // TODO: use a promise, what year is it?
    const img = document.createElement("img");
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.style.display = "none";
    document.body.appendChild(img);
    let colorSum = 0;

    img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r, g, b, avg;

        for (let x = 0, len = data.length; x < len; x += 4) {
            r = data[x];
            g = data[x + 1];
            b = data[x + 2];
            avg = Math.floor((r + g + b) / 3);
            colorSum += avg;
        }

        const brightness = Math.floor(colorSum / (this.width * this.height));
        if (brightness > 127) {
            isBright = true;
        } else {
            isBright = false;
        }
        callback(brightness);
    };
}

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

// get background type (either image, blur or fancy) from browser local storage
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
};

const processPalette = () => {
    // Yeah, I guess map would work here too
    return isBright
        ? {
              color1: internalPalette.Vibrant.rgb,
              color2: internalPalette.LightMuted.rgb,
              color3: internalPalette.LightVibrant.rgb
          }
        : {
              color1: internalPalette.Vibrant.rgb,
              color2: internalPalette.DarkMuted.rgb,
              color3: internalPalette.DarkVibrant.rgb
          };
};

const updateBackgroundFancy = (processedPalette) => {
    console.log("Previous Fancy palette", oldFancyColors);
    console.log("Processed palette", processedPalette);
    if (JSON.stringify(oldFancyColors) !== JSON.stringify(processedPalette)) {
        oldFancyColors = processedPalette;
        // I shouldn't have done that but it works
        import("./fancyBlur.js")
            .then(({ updateColors }) => {
                updateColors(processedPalette);
            })
            .catch((error) => {
                console.error(error);
            });
    }
};

// flow: set duration -> start animation -> removeAnimation -> repeat

const setProgressAnimationDuration = (duration) => {
    // sets duration in seconds
    r.style.setProperty(`--animationDuration`, `${duration}s`);
};

const startProgressAnimation = () => {
    document.querySelector(".thumbnail-border").classList.add("animate");
};

const removeProgressAnimation = () => {
    document.querySelector(".thumbnail-border").classList.remove("animate");
};

const pauseProgressAnimationAndCover = () => {
    document.querySelector(".thumbnail-border").classList.add("paused");
    document.querySelector(".song-thumbnail").classList.add("paused");
};

const resumeProgressAnimationAndCover = () => {
    document.querySelector(".thumbnail-border").classList.remove("paused");
    document.querySelector(".song-thumbnail").classList.remove("paused");
};

const restartAnimation = (duration) => {
    removeProgressAnimation();
    setTimeout(() => {
        setProgressAnimationDuration(duration);
        startProgressAnimation();
    }, 10);
};

let socket = io();
socket.on("metadata", (metadata) => {
    let title = document.querySelector("#title");
    let album = document.querySelector("#album");
    let artist = document.querySelector("#artist");
    title.textContent = metadata.title;
    album.textContent = metadata.album;
    artist.textContent = metadata.artist;
    // placeholder duration in case the retrieval fails
    restartAnimation(180);
});

socket.on("pictureData", (pictureData) => {
    let img = document.querySelector("#cover");
    img.src = `data:image/png;base64,` + pictureData;
    updateBackground(backgroundType, pictureData);
    getBrightness(img.src, (brightness) => {
        console.log("Image brightness:" + brightness);
        console.log(
            "That means the image " + (isBright ? "is" : "is not") + " bright"
        );
        document.body.style.backgroundColor = isBright ? "white" : "black";
        r.style.setProperty(
            `--progressBackground`,
            isBright ? "#ffffffAA" : "#000000AA"
        );
    });
});

socket.on("palette", (palette) => {
    applyPallette(palette);
    if (backgroundType === "fancy") {
        updateBackgroundFancy(processPalette());
    }
});

socket.on("progress", (progress) => {
    console.log("Progress", progress);
    restartAnimation(progress != 1 ? progress : 180); // fallback value
});

socket.on("playing", (playing) => {
    if (playing) {
        resumeProgressAnimationAndCover();
    } else {
        pauseProgressAnimationAndCover();
    }
});

document.addEventListener("DOMContentLoaded", onInit, false);
