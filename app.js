import { fromLonLat } from 'ol/proj';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { always as conditionAlways } from 'ol/events/condition';
import TransformInteraction from 'ol-ext/interaction/Transform';
import { printAndDownload } from './print';

// imports the OL stylesheet for nicer buttons!
import 'ol/ol.css';

// compute the map center from longitude and latitude
const mapCenter = fromLonLat([8.32, 46.90]);

// a simple OpenStreetMap layer (for development purposes)
const osmLayer = new TileLayer({
  source: new OSM()
});

// our rectangle (width to height ratio is √2 as per DIN paper formats)
const rectWidth = 100000;
const rectHeight = rectWidth / Math.sqrt(2);
const rectangle = new Feature({
  geometry: new Polygon([[
    [mapCenter[0] - rectWidth, mapCenter[1] + rectHeight],
    [mapCenter[0] + rectWidth, mapCenter[1] + rectHeight],
    [mapCenter[0] + rectWidth, mapCenter[1] - rectHeight],
    [mapCenter[0] - rectWidth, mapCenter[1] - rectHeight],
  ]])
});

// this vector layer will contain our rectangle
const vectorLayer = new VectorLayer({
  source: new VectorSource({
    features: [rectangle]
  })
});

// this will give the user the possibility to move the rectangle around
// and resize it by dragging its corners
const transform = new TransformInteraction({
  layers: vectorLayer,
  stretch: false,
  keepAspectRatio: conditionAlways,
  rotate: false
});

// create the interactive map
const map = new Map({
  target: 'map-root',
  view: new View({
    zoom: 7,
    center: mapCenter,
    constrainResolution: true
  }),
  layers: [osmLayer, vectorLayer]
});

map.addInteraction(transform);

// bind the print button click handler
document.getElementById('print-btn').addEventListener('click', () => {
  printAndDownload(rectangle.getGeometry());
});
