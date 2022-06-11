# ShairportGUI

A nice web interface for showing the shairport-sync metadata.

<table>
  <thead>
    <tr>
      <th>Horizontal</th>
      <th>Vertical</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <image alt="Your Love is a Drug by Garoad" src="img/Screen1.png">
      </td>
      <td rowspan="2">
        <image alt="Devil Trigger by Casey Edwards" src="img/Screen3.png" height="100%">
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
-   parts of CSS from [neumorphism, pure css](https://codepen.io/b-r-y/pen/wvrXdEd) by Bryanna Lucyk
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

## Notes

First of all, if you'd like to use the blurred image background, you have to uncomment marked lines in the `styles.css` file. Default is gradient as the text is more readable.

This project was build with Raspberry Pi Zero W in mind. While the server part works well on the Pi, the web part is somewhat sluggish, but works well on another computers on the LAN. Also because of this you'll find commented code that _will_ work, just not so well on Pi (so animations, some CSS properties etc.). Also this hasn't been tested with many other resolutions than 1080p. The album art is hardcoded at 750px x 750px, so this might not look good enough on larger screens/scales (easily fixable though).

Also, the code probably could've been written more cleanly and overall better. Considering this project is still in progress some things may change for the better. Or worse if I become a feature creep.

~~And yes, I know, move the css and js outside. I know, I tried, and I'm too lazy.~~ Goddamit Jarek
