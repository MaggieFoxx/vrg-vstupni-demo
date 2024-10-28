import { getLength } from "ol/sphere";
import { LineString } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { useUnits } from "../src/UnitsContext";

export const useFormattedUnits = () => {
  const { distanceUnit, angleUnit } = useUnits();

  const formatLength = (line: LineString): string => {
    const length = getLength(line);
    console.log(distanceUnit);
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

  return { formatLength, calculateAzimuth };
};
