# ShairportGUI

A nice web interface for showing the shairport-sync metadata.

<table>
  <thead>
    <tr>
      <th>Horizontal (Static Gradient and Blurred Image)</th>
      <th>Vertical (BlurHash, believe me, it moves)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <image alt="Your Love is a Drug by Garoad" src="img/Screen1.png">
      </td>
      <td rowspan="2">
        <image alt="Addict by Silva Hound" src="img/Screen3.png" height="100%">
      </td>
    </tr>
    <tr>
      <td>
        <image alt="Myths You Forgot by Camellia and Toby Fox" src="img/Screen2.png">
      </td>
    </tr>
  </tbody>
</table>

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

This project is inspired by [Shairport Sync Metadata Display](https://github.com/AlainGourves/shairport-metadata-display) and works similarly, but without any fancy transitions. And has less features ofc.

## Prerequisites

-   [shairport-sync](https://github.com/mikebrady/shairport-sync) build with `--with-metadata` option and configured, obviously. Preferably under some Linux distro as that's what the project's been written under. Unless you understand Cygwin pipes. Then teach me. Or you got the UDP working, then it should run just fine under Windows.
-   Node.js - used 18.1.0, other versions should also work.

## Run

```
$ npm install
$ npm start
```

## Known issues

-   Sometimes, in very specific cases, the palette will be undefined and the app will crash. I will somehow handle this case in the future, but for now I recommend running it with a utility like [forever](https://www.npmjs.com/package/forever).
    -   I have to get to the bottom of this though. Goodbye Moonmen on Apple Music always triggers the crash. Perhaps it's jpg instead of png?

## Backgrounds
### Styles
As of now I'm playing with different styles of background. Now, there are 3 styles:
* Blurred Image
* Static Gradient based off album cover image palette
* Moving Gradient generated with BlurHash

Default is Static Gradient but you can change the currently used type by **clicking the album cover** (currently used type is saved in local storage).

### Pros and Cons, objectively
* Blurred image will make text illegible on many backgrounds, unless you want to make the white-on-black impact meme font your default.
* Gradient based off the palette has to wait for the palette to be sent, but makes the text readable from distance in 99% cases
* BlurHash is fast, but not on super-low-end systems like Pi Zero (chromium just hangs). Also makes moving the blur Apple Music style easier

### Proc and Cons, imo
* Blurred image will look... wierd to say the least on images with large text (think NCS covers)
* Gradient looks nice and all, but could've be done cleverer. Making it dynamic and moving around would require some tinkering or layering of divs so I'm thinking of a better approach.
* BlurHash is fast, is nice, but it's designed for thumbnail placeholders. Sometimes it will get you a great background, other times it will look bright even for pitch-black covers. Also it's client side so my Pi Zero just refuses to run the webpage.
* 
## Notes

This project was build with Raspberry Pi Zero W in mind. But is no longer. I decided that it's too much for a little poor Pi Zero to handle both a server and Chromium so if you want to tun it on Pi just disable animations and blurHash.

Also, the code probably could've been written more cleanly and overall better. Considering this project is still in progress some things may change for the better. Or worse if I become a feature creep.

~~And yes, I know, move the css and js outside. I know, I tried, and I'm too lazy.~~ Goddamit Jarek
