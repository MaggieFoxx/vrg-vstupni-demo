export type LineCoordinates = {
  startLon: number | null;
  startLat: number | null;
  endLon: number | null;
  endLat: number | null;
};
export const defaultLineCoordinates: LineCoordinates = {
  startLon: null,
  startLat: null,
  endLon: null,
  endLat: null,
};
