import { getLength } from "ol/sphere";
import { LineString } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { useUnits } from "../src/UnitsContext";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import { LineCoordinates } from "../src/LineCoordinatesInput";

export const useFormattedUnits = () => {
  const { distanceUnit, angleUnit } = useUnits();

  const formatLength = (line: LineString): string => {
    const length = getLength(line);
    if (distanceUnit === "miles") {
      return (length / 1609.34).toFixed(2) + " miles";
    }
    if (length > 100) {
      return (length / 1000).toFixed(2) + " km";
    }
    return length.toFixed(2) + " m";
  };

  const calculateAzimuth = (start: Coordinate, end: Coordinate): string => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const [lon1, lat1] = start.map(toRadians);
    const [lon2, lat2] = end.map(toRadians);
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const azimuthDegrees = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    return angleUnit === "radians"
      ? toRadians(azimuthDegrees).toFixed(2) + " rad"
      : azimuthDegrees.toFixed(2) + "°";
  };

const calculateAngle = (coordinates: LineString): string => {
  const coordinatesArray = coordinates.getCoordinates();
  console.log(coordinatesArray);
  if (coordinatesArray.length < 3) return "0";

  const [start1, end1] = [coordinatesArray[coordinatesArray.length - 3], coordinatesArray[coordinatesArray.length - 2]];
  const [start2, end2] = [coordinatesArray[coordinatesArray.length - 1], coordinatesArray[coordinatesArray.length - 2]];

  const angle1 = Math.atan2(end1[1] - start1[1], end1[0] - start1[0]);
  const angle2 = Math.atan2(end2[1] - start2[1], end2[0] - start2[0]);

  console.log(angle1, angle2);

  const angleBetween = angle2 - angle1;
  const angleDegrees = (angleBetween * 180 / Math.PI + 360) % 360;
  const angleRadians = angleBetween < 0 ? angleBetween + 2 * Math.PI : angleBetween;

  return angleUnit === "radians"
    ? angleRadians.toFixed(2) + " rad"
    : angleDegrees.toFixed(2) + "°";
}
return { formatLength, calculateAzimuth, calculateAngle };
};

export const getTooltipText = (mode: string): string => {
    let helpMsg = "Click to start drawing";
    if (mode === "drawing") {
      helpMsg = "Click to continue drawing the line";
    } else if (mode === "deleting") {
      helpMsg = "Click on a line to delete it";
    } else if (mode === "editing") {
      helpMsg = "Click on a line to edit";
    } else if (mode === "measuringAngle") {
      helpMsg = "Draw two lines to measure the angle";
    }
    return helpMsg;
}

export const createNewLine = (lineCoordinates: LineCoordinates) => {
  const { startLon, startLat, endLon, endLat } = lineCoordinates;
  const start = fromLonLat([startLon, startLat]);
  const end = fromLonLat([endLon, endLat]);
  const line = new LineString([start, end]);

  return new Feature({
    geometry: line,
  });
}
