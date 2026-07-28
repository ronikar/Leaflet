# Rotate Leaflet Map

> **Originally published as [`leaflet-rotate-map`](https://www.npmjs.com/package/leaflet-rotate-map).**
> That unscoped package covers versions up to `0.3.1`. From `0.3.2` onwards the
> package is published under the `@ronikar` scope as `@ronikar/leaflet-rotate-map`.
> Same project, same repository — only the npm package name changed.

Enable to rotate Leaflet maps. The code is based on a merger between lastest official leaflet version and leaflet `rotate` branch.
In addition, there are some improvements like:

* Fix popup
* Add getCircumscribedBounds
* Fix Draggable
* Fix `map.setView`
* Fix `_onDragStart` when map has `maxBounds` and map is rotated

## Demo
Look at `index.html` file in `examples` folder

## Usage

### Setup

* Add script to html. You can use `leaflet-src.js` in `./dist` folder. 
```html
<script src="leaflet-src.js"></script>
```

* You can also use `npm install @ronikar/leaflet-rotate-map` or `yarn add @ronikar/leaflet-rotate-map`.

### L.map(id, options)

To instantiate a `L.Map` with rotation, add `rotate` option

```js
const map = L.map('map', { rotate: true });
```