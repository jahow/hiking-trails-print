import { toLonLat } from "ol/proj";
import { getDistance } from "ol/sphere";
import { downloadBlob, print } from "@camptocamp/inkmap";

const genericLayer = {
  type: 'WMTS',
  requestEncoding: 'REST',
  matrixSet: 'EPSG:2056',
  projection: 'EPSG:2056',
  tileGrid: {
    resolutions: [
      4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
      1000, 750, 650, 500, 250, 100, 50, 20
    ],
    origin: [2420000, 1350000]
  },
  attribution: '© Swisstopo'
};

const bgLayer = {
  ...genericLayer,
  url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg',
  opacity: 0.4,
};

const trailsLayer = {
  ...genericLayer,
  url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swisstlm3d-wanderwege/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.png',
};

/**
 * Requests a print from inkmap, download the resulting image
 * @param {Polygon} rectangleGeometry
 */
export function printAndDownload(rectangleGeometry) {
  // first get the geometry center in longitude/latitude
  const geomExtent = rectangleGeometry.getExtent();
  const center = toLonLat(rectangleGeometry.getInteriorPoint().getCoordinates());

  // let's target a final format of A4: the map will be 277 x 170 millimeters
  const size = [277, 170, 'mm'];

  // now the hard part: compute the scale denominator
  // which is the ratio between the rectangle size in real world units and the final printed size
  // to do this we measure the width of the rectangle in meters and compare it to the desired paper size
  const lowerLeft = toLonLat([geomExtent[0], geomExtent[1]]);
  const lowerRight = toLonLat([geomExtent[2], geomExtent[1]]);
  const geomWidthMeters = getDistance(lowerLeft, lowerRight);
  const scale = geomWidthMeters * 1000 / size[0]; // paper size is in mm!

  // let's print!
  print({
    layers: [bgLayer, trailsLayer],
    dpi: 150,
    size,
    center,
    scale,
    projection: 'EPSG:2056',
    scaleBar: true,
    northArrow: true
  }).then(imageBlob => downloadBlob(imageBlob, 'hiking-trails.png'));
}
