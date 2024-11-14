import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import { LineCoordinates } from "../src/LineCoordinatesInput";
import { Geometry, LineString } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { Overlay } from "ol";
import { MutableRefObject } from "react";

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

export const calculateLineMetrics = (
  line: LineString,
  start: Coordinate,
  end: Coordinate,
  formatLength: (line: LineString) => string,
  calculateAzimuth: (start: Coordinate, end: Coordinate) => string
) => {
  const length = formatLength(line);
  const azimuth = calculateAzimuth(start, end);
  return { length, azimuth };
};

export const modifyTooltip = (
  feature: Feature<Geometry>,
  overlaysRef: MutableRefObject<
    { feature: Feature<Geometry>; overlay: Overlay }[]
  >,
  selectedFeatureRef: MutableRefObject<Feature<Geometry> | null>,
  coordinates: {
    startLon: number;
    startLat: number;
    endLon: number;
    endLat: number;
  },
  formatLength: { (line: LineString): string; (line: LineString): string },
  calculateAzimuth: {
    (start: Coordinate, end: Coordinate): string;
    (start: Coordinate, end: Coordinate): string;
  }
) => {
  const geometry = feature.getGeometry() as LineString;
  const overlay = overlaysRef.current.find(
    (o) => o.feature === selectedFeatureRef.current
  )?.overlay;
  if (overlay) {
    overlay.setPosition(fromLonLat([coordinates.endLon, coordinates.endLat]));
    const { length, azimuth } = calculateLineMetrics(
      geometry,
      [coordinates.startLon, coordinates.startLat],
      [coordinates.endLon, coordinates.endLat],
      formatLength,
      calculateAzimuth
    );
    overlay.getElement()!.innerHTML = `${length} | Azimuth: ${azimuth}`;
  }
};
