import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import { LineCoordinates } from "../src/LineCoordinatesInput";
import { Geometry, LineString } from "ol/geom";

export const createNewLine = (lineCoordinates: LineCoordinates) => {
  const { startLon, startLat, endLon, endLat } = lineCoordinates;
  const start = fromLonLat([startLon, startLat]);
  const end = fromLonLat([endLon, endLat]);
  const line = new LineString([start, end]);

  return new Feature({
    geometry: line,
  });
};

export const getLineCoordinates = (feature: Feature<Geometry>) => {
  const geometry = feature.getGeometry();
  if (geometry instanceof LineString) {
    const coordinates = geometry.getCoordinates();
    const start = toLonLat(coordinates[0]);
    const end = toLonLat(coordinates[coordinates.length - 1]);
    return {
      startLon: start[0],
      startLat: start[1],
      endLon: end[0],
      endLat: end[1],
    };
  }
  return null;
};
