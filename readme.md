# ShairportGUI

A nice web interface for showing the shairport-sync metadata.

<table>
  <thead>
    <tr>
      <th colspan=2>Horizontal (Static Gradient)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2">
        <image alt="Your Love is a Drug by Garoad" src="img/Screen1.png">
      </td>
    </tr>
    <tr>
      <th colspan=2>Horizontal (Blurred Image)</th>  
    </tr>
    <tr>
      <td colspan="2">
        <image alt="Myths You Forgot by Camellia and Toby Fox" src="img/Screen2.png">
      </td>
    </tr>
    <tr>
      <th>Vertical (BlurHash, with background animation)</th>
      <th>Changing background types</th>
    </tr>
    <tr>
      <td>
        <image alt="Heaven's door by AJ Dispirito" src="https://user-images.githubusercontent.com/15912902/174042168-1ead1263-ad52-4bd3-80e1-e6fe0b09d2e6.gif" width="100%">
      </td>
      <td>
        <image alt="Addict by Silva Hound" src="https://user-images.githubusercontent.com/15912902/174038813-84c5aa6f-afd4-4e30-a4e8-75cd73053bd3.gif" width="100%">
      </td>
    </tr>
  </tbody>
</table>

<sub><sup>Don't mind the gif compression</sup></sub>

## What did I use?

Built using:

-   Node.js
-   [shairport-sync-reader](https://www.npmjs.com/package/shairport-sync-reader)
-   socket.io
-   [node-vibrant](https://www.npmjs.com/package/node-vibrant)
-   GitHub Copilot (because I'm learning Node)
-   parts of CSS from [neumorphism, pure css](https://codepen.io/b-r-y/pen/wvrXdEd) by Bryanna Lucyk (though after some refactorings I mainly use the neumorphic drop-shadows)
-   [Dens49's port](https://github.com/Dens49/blurhash-js) of [blurhash](https://blurha.sh/) to ES6
-   the mighty power of `F L E X B O X`

This project is inspired by [Shairport Sync Metadata Display](https://github.com/AlainGourves/shairport-metadata-display) and works similarly, but without any fancy transitions. And has less features ofc (though one might argue if fancy looks are better than music controls).

## Prerequisites

-   [shairport-sync](https://github.com/mikebrady/shairport-sync) build with `--with-metadata` option and configured, obviously. Preferably under some Linux distro as that's what the project's been written under. Unless you understand Cygwin pipes. Then teach me. Or you got the UDP working, then it should run just fine under Windows.
-   Node.js - used 18.1.0, other versions should also work.

## Run

```
$ npm install
$ npm start
```

## Features
### Playback
Using the shairport-sync-reader you get track title, album, artist and an image. There's a whole lot more metadata available so you can easily add your own favorite info, but I didn't need that, so it's not used.
### Responsiveness
Everything is written to fit many screen sizes, scales and both horizontal and vertical orientations. Now there are no hardcoded pixel sizes (maybe apart from `blur(70px)`).  
The current `@media` query might not fit your needs though, but you can easily change it.
### Backgrounds
Currently 3 types of backgrounds are supported:
* Blurred Image - the same image as on the cover, but blurred
* Static Gradient - gradients generated from the color palette
* BlurHash - animated gradient-like image using BlurHash

They all have their pros and cons, but you can decide which you like the most by clicking on the image to toggle between them (current selection is saved to local storage so you don't have to redo this every time).  
Imo the text is most readable on the Static Gradient, but BlurHash almost mimics Apple Music's fancy moving blur.  
Also both Static Gradient and BlurHash have some filters applied like `saturation(1.5)` and `brightness(0.8)`. You can ofc adjust them to your liking.

## Known issues

-   Sometimes, in very specific cases, the palette will be undefined and the app will crash. I will somehow handle this case in the future, but for now I recommend running it with a utility like [forever](https://www.npmjs.com/package/forever).
    -   I have to get to the bottom of this though. Goodbye Moonmen on Apple Music always triggers the crash. Perhaps it's jpg instead of png?

## What's next?
* Resize text if too big to fit
* Small and quick notification what background is selected on change (since in some cases they are indistinguishable)
* Stopping the spinning animation once paused, and resume when played
* Merging in [Spotify support](https://github.com/JaroslawPokropinski/ShairportGUI) (without Airplay) by [JaroslawPokropinski](https://github.com/JaroslawPokropinski).
  * Note: Spotify works just fine if playing via Airplay. This fork brings in Spotify API into the play.
* Representing progress via image border (think rounded progress bar)
* Support for WS2812B LED strips (unsure if via this project, or a seperate one)
* HomeKit lights support (but super far into the future as I don't even own a single RGB lightbulb)

## Notes

This project was build with Raspberry Pi Zero W in mind. But is no longer. I decided that it's too much for a little poor Pi Zero to handle both a server and Chromium so if you want to run it on Pi just disable animations and blurHash.

Also, the code probably could've been written more cleanly and overall better. Considering this project is still in progress some things may change for the better. Or worse if I become a feature creep (looking at the roadmap, yeah).

~~And yes, I know, move the css and js outside. I know, I tried, and I'm too lazy.~~ Goddamit Jarek. Thanks though!
