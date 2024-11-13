import { getLength } from "ol/sphere";
import { LineString } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { useUnits } from "../src/UseUnits";

const MILES_TO_METERS = 1609.34;
const METERS_TO_KILOMETERS = 1000;
const LENGTH_THRESHOLD = 100;
const FULL_CIRCLE_DEGREES = 360;
const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const DECIMAL_PLACES = 2;

export const useFormattedUnits = () => {
  const { distanceUnit, angleUnit } = useUnits();

  const formatLength = (line: LineString): string => {
    const length = getLength(line);
    if (distanceUnit === "miles") {
      return (length / MILES_TO_METERS).toFixed(DECIMAL_PLACES) + " miles";
    } else {
      if (length > LENGTH_THRESHOLD) {
        return (length / METERS_TO_KILOMETERS).toFixed(DECIMAL_PLACES) + " km";
      }
      return length.toFixed(DECIMAL_PLACES) + " m";
    }
  };

  const calculateAzimuth = (start: Coordinate, end: Coordinate): string => {
    const toRadians = (degrees: number) => degrees * DEGREES_TO_RADIANS;
    const [lon1, lat1] = start.map(toRadians);
    const [lon2, lat2] = end.map(toRadians);
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const azimuthDegrees =
      (Math.atan2(y, x) * RADIANS_TO_DEGREES + FULL_CIRCLE_DEGREES) %
      FULL_CIRCLE_DEGREES;
    return angleUnit === "radians"
      ? toRadians(azimuthDegrees).toFixed(2) + " rad"
      : azimuthDegrees.toFixed(2) + "°";
  };

  const calculateAngle = (coordinates: LineString): string => {
    const coordinatesArray = coordinates.getCoordinates();
    console.log(coordinatesArray);
    if (coordinatesArray.length < 3) return "0";

    const [start1, end1] = [
      coordinatesArray[coordinatesArray.length - 3],
      coordinatesArray[coordinatesArray.length - 2],
    ];
    const [start2, end2] = [
      coordinatesArray[coordinatesArray.length - 1],
      coordinatesArray[coordinatesArray.length - 2],
    ];

    const angle1 = Math.atan2(end1[1] - start1[1], end1[0] - start1[0]);
    const angle2 = Math.atan2(end2[1] - start2[1], end2[0] - start2[0]);

    console.log(angle1, angle2);

    const angleBetween = angle2 - angle1;
    const angleDegrees =
      (angleBetween * RADIANS_TO_DEGREES + FULL_CIRCLE_DEGREES) %
      FULL_CIRCLE_DEGREES;
    const angleRadians =
      angleBetween < 0 ? angleBetween + 2 * Math.PI : angleBetween;

    return angleUnit === "radians"
      ? angleRadians.toFixed(DECIMAL_PLACES) + " rad"
      : angleDegrees.toFixed(DECIMAL_PLACES) + "°";
  };
  return { formatLength, calculateAzimuth, calculateAngle };
};