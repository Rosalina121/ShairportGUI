import * as PIXI from "https://cdn.skypack.dev/pixi.js";
import { KawaseBlurFilter } from "https://cdn.skypack.dev/@pixi/filter-kawase-blur";
import SimplexNoise from "https://cdn.skypack.dev/simplex-noise";
import hsl from "https://cdn.skypack.dev/hsl-to-hex";
import debounce from "https://cdn.skypack.dev/debounce";

const RGBToHSL = (r, g, b) => {
    console.log(r + " " + g + "" + b);
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
            ? 2 + (b - r) / s
            : 4 + (r - g) / s
        : 0;
    console.log(h + " " + s + "" + l);
    return [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2
    ];
};

// Create PixiJS app
const app = new PIXI.Application({
    // render to <canvas class="orb-canvas"></canvas>
    view: document.querySelector(".orb-canvas"),
    // auto adjust size to fit the current window
    resizeTo: window,
    // transparent background, we will be creating a gradient background later using CSS
    transparent: true
});

app.stage.filters = [new KawaseBlurFilter(70, 10, true)];

// Create a new simplex noise instance
const simplex = new SimplexNoise();

// return a random number within a range
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// map a number from 1 range to another
function map(n, start1, end1, start2, end2) {
    return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

// Orb class
class Orb {
    // Pixi takes hex colors as hexidecimal literals (0x rather than a string with '#')
    constructor(fill = 0x000000) {
        // bounds = the area an orb is "allowed" to move within
        this.bounds = this.setBounds();
        // initialise the orb's { x, y } values to a random point within it's bounds
        this.x = random(this.bounds["x"].min, this.bounds["x"].max);
        this.y = random(this.bounds["y"].min, this.bounds["y"].max);

        // how large the orb is vs it's original radius (this will modulate over time)
        this.scale = 1;

        // what color is the orb?
        this.fill = fill;

        if (window.innerWidth >= window.innerHeight) {
            this.radius = random(window.innerWidth / 4, window.innerWidth / 2);
        } else {
            this.radius = random(
                window.innerHeight / 4,
                window.innerHeight / 2
            );
        }

        // starting points in "time" for the noise/self similar random values
        this.xOff = random(0, 1000);
        this.yOff = random(0, 1000);
        // how quickly the noise/self similar random values step through time
        this.inc = 0.00007;

        // PIXI.Graphics is used to draw 2d primitives (in this case a circle) to the canvas
        this.graphics = new PIXI.Graphics();
        this.graphics.alpha = 0.825;

        // 250ms after the last window resize event, recalculate orb positions.
        window.addEventListener(
            "resize",
            debounce(() => {
                this.bounds = this.setBounds();
            }, 250)
        );
    }
    setBounds() {
        // how far from the { x, y } origin can each orb move
        let maxDist = 0;
        if (window.innerWidth >= window.innerHeight) {
            maxDist = window.innerWidth;
        } else {
            maxDist = window.innerHeight;
        }

        // the { x, y } origin for each orb (the bottom right of the screen)
        const originX = window.innerWidth / 2;
        const originY = window.innerHeight / 2;

        // allow each orb to move x distance away from it's { x, y }origin
        return {
            x: {
                min: originX - maxDist,
                max: originX + maxDist
            },
            y: {
                min: originY - maxDist,
                max: originY + maxDist
            }
        };
    }
    update() {
        // self similar "psuedo-random" or noise values at a given point in "time"
        const xNoise = simplex.noise2D(this.xOff, this.xOff);
        const yNoise = simplex.noise2D(this.yOff, this.yOff);
        const scaleNoise = simplex.noise2D(this.xOff, this.yOff);

        // map the xNoise/yNoise values (between -1 and 1) to a point within the orb's bounds
        this.x = map(xNoise, -1, 1, this.bounds["x"].min, this.bounds["x"].max);
        this.y = map(yNoise, -1, 1, this.bounds["y"].min, this.bounds["y"].max);
        // map scaleNoise (between -1 and 1) to a scale value somewhere between half of the orb's original size, and 100% of it's original size
        this.scale = map(scaleNoise, -1, 1, 0.5, 1);

        // step through "time"
        this.xOff += this.inc;
        this.yOff += this.inc;
    }
    render() {
            // update the PIXI.Graphics position and scale values
            this.graphics?.x = this.x;
            this.graphics?.y = this.y;
            this.graphics?.scale.set(this.scale);

            // clear anything currently drawn to graphics
            this.graphics?.clear();

            // tell graphics to fill any shapes drawn after this with the orb's fill color
            this.graphics?.beginFill(this.fill);
            // draw a circle at { 0, 0 } with it's size set by this.radius
            this.graphics?.drawCircle(0, 0, this.radius);
            // let graphics know we won't be filling in any more shapes
            this.graphics?.endFill();
    }
}

const cssVarToHSL = (colorFromRoot) => {
    // const colorArray = colorFromRoot.split(",").map((item) => {
    //     return parseInt(item, 10);
    // });
    return RGBToHSL(colorFromRoot[0], colorFromRoot[1], colorFromRoot[2]);
};

class ColorPalette {
    constructor() {
        this.palette = {
            songColor: [254, 1, 193],
            artistColor: [249, 212, 2],
            borderColor: [0, 194, 255]
        };
        this.setColors();
        this.setCustomProperties();
    }

    setPalette(palette) {
        this.palette = palette;
    }

    setColors() {
        // initial colors
        const songColor = this.palette.songColor;
        console.log(songColor);
        const artistColor = this.palette.artistColor;
        console.log(artistColor);
        const borderColor = this.palette.borderColor;
        console.log(borderColor);

        const songColorHSL = cssVarToHSL(songColor);
        const artistColorHSL = cssVarToHSL(artistColor);
        const borderColorHSL = cssVarToHSL(borderColor);

        console.log(songColorHSL);
        console.log(artistColorHSL);
        console.log(borderColorHSL);

        this.baseColor = hsl(
            borderColorHSL[0],
            borderColorHSL[1],
            borderColorHSL[2]
        );
        this.complimentaryColor1 = hsl(
            artistColorHSL[0],
            artistColorHSL[1],
            artistColorHSL[2]
        );
        this.complimentaryColor2 = hsl(
            songColorHSL[0],
            songColorHSL[1],
            songColorHSL[2]
        );

        // store the color choices in an array so that a random one can be picked later
        this.colorChoices = [
            this.baseColor,
            this.complimentaryColor1,
            this.complimentaryColor2
        ];
    }

    randomColor() {
        // pick a random color
        return this.colorChoices[~~random(0, this.colorChoices.length)].replace(
            "#",
            "0x"
        );
    }

    setCustomProperties() {
        // set CSS custom properties so that the colors defined here can be used throughout the UI
        document.documentElement.style.setProperty("--hue", this.hue);
        document.documentElement.style.setProperty(
            "--hue-complimentary1",
            this.complimentaryHue1
        );
        document.documentElement.style.setProperty(
            "--hue-complimentary2",
            this.complimentaryHue2
        );
    }
}

export const startFancyBlur = (palette) => {
    console.log("startFancyBlur");
    document.querySelector(".background-img").style.display = "none";

    const colorPalette = new ColorPalette();
    if (palette) {
        colorPalette.setPalette(palette);
    } else {
        const backupPalette = {
            songColor: [254, 1, 193],
            artistColor: [249, 212, 2],
            borderColor: [0, 194, 255]
        };
        colorPalette.setPalette(backupPalette);
    }

    // app.ticker = new PIXI.Ticker();

    // Create orbs
    const orbs = [];
    console.log("Children count: " + app.stage.children.length);
    while (app.stage.children[0]) {
        app.stage.children[0].destroy();
    }
    console.log("Children count after removal: " + app.stage.children.length);

    for (let i = 0; i < 10; i++) {
        const orb = new Orb(colorPalette.randomColor());

        app.stage.addChild(orb.graphics);

        orbs.push(orb);
    }
    console.log("Children count after new added: " + app.stage.children.length);

    // Animate!
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        app.ticker.add(() => {
            // update and render each orb, each frame. app.ticker attempts to run at 60fps
            orbs.forEach((orb) => {
                orb?.update();
                orb?.render();
            });
        });
    } else {
        // perform one update and render per orb, do not animate
        orbs.forEach((orb) => {
            orb.update();
            orb.render();
        });
    }
};
