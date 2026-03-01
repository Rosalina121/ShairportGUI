let r = document.querySelector(":root");

let backgroundType = "image";
const imgContainer = document.querySelector(".background-img");

let internalPalette = {};
let oldFancyColors = {};
let isBright = true;

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
    initOptions();
};

const changeStyle = (backgroundTypeVar) => {
    resetStyle();
    processTypes(backgroundTypeVar);
    saveBackgroundType(backgroundTypeVar);
    backgroundType = backgroundTypeVar;
};

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
};

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
            break;
    }
};

const updateBackgroundImage = (pictureData) => {
    imgContainer.style.backgroundImage = `url(data:image/png;base64,${pictureData})`;
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
        import("./fancyBlur.js")
            .then(({ updateColors }) => {
                updateColors(processedPalette);
            })
            .catch((error) => {
                console.error(error);
            });
    }
};

// Options Logic
const initOptions = () => {
    const optionsBtn = document.querySelector("#options-btn");
    const optionsMenu = document.querySelector("#options-menu");
    const spinToggle = document.querySelector("#spin-toggle");
    const shapeSelect = document.querySelector("#shape-select");

    // Load preferences
    const isSpinning = localStorage.getItem("coverSpinning") !== "false";
    const coverShape = localStorage.getItem("coverShape") || "circle";

    spinToggle.checked = isSpinning;
    shapeSelect.value = coverShape;

    spinToggle.disabled = coverShape !== "circle";

    applySpinning(isSpinning);
    applyShape(coverShape);

    optionsBtn.onclick = (e) => {
        e.stopPropagation();
        optionsMenu.classList.toggle("visible");
    };

    document.addEventListener("click", (e) => {
        if (!optionsMenu.contains(e.target) && e.target !== optionsBtn) {
            optionsMenu.classList.remove("visible");
        }
    });

    spinToggle.onchange = (e) => {
        const spinning = e.target.checked;
        localStorage.setItem("coverSpinning", spinning);
        applySpinning(spinning);
    };

    shapeSelect.onchange = (e) => {
        const shape = e.target.value;
        localStorage.setItem("coverShape", shape);
        spinToggle.disabled = shape !== "circle";
        applyShape(shape);
    };
};

const applySpinning = (isSpinning) => {
    const container = document.querySelector("#spin-container");
    const shape = localStorage.getItem("coverShape") || "circle";
    
    if (isSpinning && shape === "circle") {
        container.classList.add("spinning");
    } else {
        container.classList.remove("spinning");
    }
};

const applyShape = (shape) => {
    const cover = document.querySelector("#cover");
    const container = document.querySelector("#thumbnail-container");
    const spinContainer = document.querySelector("#spin-container");
    
    cover.classList.remove("circle", "rounded-square");
    container.classList.remove("circle", "rounded-square");
    spinContainer.classList.remove("circle", "rounded-square");
    
    cover.classList.add(shape);
    container.classList.add(shape);
    spinContainer.classList.add(shape);
    
    const isSpinning = localStorage.getItem("coverSpinning") !== "false";
    applySpinning(isSpinning);
};


const setProgressAnimationDuration = (duration) => {
    r.style.setProperty(`--animationDuration`, `${duration}s`);
};

const startProgressAnimation = () => {
    document.querySelector(".thumbnail-border").classList.add("animate");
};

const removeProgressAnimation = () => {
    document.querySelector(".thumbnail-border").classList.remove("animate");
    r.style.setProperty(`--animationCurrent`, `0s`);
};

const pauseProgressAnimationAndCover = () => {
    document.querySelector(".thumbnail-border").classList.add("paused");
    document.querySelector("#spin-container").classList.add("paused");
};

const resumeProgressAnimationAndCover = () => {
    document.querySelector(".thumbnail-border").classList.remove("paused");
    document.querySelector("#spin-container").classList.remove("paused");
};

const restartAnimation = (duration) => {
    const border = document.querySelector(".thumbnail-border");
    border.classList.remove("animate");
    r.style.setProperty(`--animationCurrent`, `0s`);
    r.style.setProperty(`--animationDuration`, `${duration}s`);
    void border.offsetWidth;
    border.classList.add("animate");
};

let socket = io();
socket.on("metadata", (metadata) => {
    let title = document.querySelector("#title");
    let album = document.querySelector("#album");
    let artist = document.querySelector("#artist");
    title.textContent = metadata.title;
    album.textContent = metadata.album;
    artist.textContent = metadata.artist;
    
    document.title = `${metadata.title} | ShairportGUI`;
    
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

let currentDuration = 0;
let lastProgressTime = 0;
let lastProgressRealTime = 0;

socket.on("progress", (data) => {
    const border = document.querySelector(".thumbnail-border");
    if (typeof data === 'object' && data !== null) {
        if (data.duration > 0) {
            const expectedCurrent = lastProgressTime + (Date.now() - lastProgressRealTime) / 1000;
            const isDesynced = Math.abs(data.current - expectedCurrent) > 1.5;
            const durationChanged = Math.abs(data.duration - currentDuration) > 1;
            
            if (!border.classList.contains("animate") || isDesynced || durationChanged) {
                border.classList.remove("animate");
                r.style.setProperty(`--animationDuration`, `${data.duration}s`);
                r.style.setProperty(`--animationCurrent`, `${data.current}s`);
                
                void border.offsetWidth;
                border.classList.add("animate");
                
                currentDuration = data.duration;
                lastProgressTime = data.current;
                lastProgressRealTime = Date.now();
            }
        }
    } else {
        let duration = data != 1 ? data : 180;
        restartAnimation(duration);
    }
});

socket.on("playing", (playing) => {
    if (playing) {
        resumeProgressAnimationAndCover();
    } else {
        pauseProgressAnimationAndCover();
    }
});

document.addEventListener("DOMContentLoaded", onInit, false);
