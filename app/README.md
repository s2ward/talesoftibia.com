# Online Tibia map viewer

This is an online Tibia map viewer (in [slippy map](https://wiki.openstreetmap.org/wiki/Slippy_Map) style) that uses the data from the [tibia-map-data](https://github.com/tibiamaps/tibia-map-data) project.

## Local setup

1. Clone this repository and `cd` to its root directory.
1. Install and use the [expected](https://github.com/tibiamaps/tibia-map/blob/main/.nvmrc) Node.js version: `nvm use`
1. Run `npm install` to install the dependencies.
1. After making changes, run `gulp` to build a new version of the `src` files into the `dist` directory.

## Credits

This code is based on the old TibiaMaps map viewer which was written by [@Cavitt](https://github.com/Cavitt) aka Syntax. Without his hard work, this repository probably wouldn’t exist. Respect! 👍🏻

This app is a modified version of @mathiasbynens tibiamaps.io [project](https://github.com/tibiamaps/tibia-map/tree/main), crosshair modified within [_js/leaflet.crosshairs.js](https://github.com/tibiamaps/tibia-map/blob/main/src/_js/leaflet.crosshairs.js)
