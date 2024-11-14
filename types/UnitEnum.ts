export enum DistanceUnit {
  MILES = "Miles",
  KILOMETERS = "Kilometers",
  METERS = "Meters",
}

export function getDistanceUnitSymbol(unit: DistanceUnit): string {
  switch (unit) {
    case DistanceUnit.MILES:
      return " miles";
    case DistanceUnit.KILOMETERS:
      return " km";
    case DistanceUnit.METERS:
      return " m";
    default:
      return "Unknown unit";
  }
}

export enum AngleUnit {
  DEGREES = "Degrees",
  RADIANS = "Radians",
}

export function getAngleUnitSymbol(unit: AngleUnit): string {
  switch (unit) {
    case AngleUnit.DEGREES:
      return "°";
    case AngleUnit.RADIANS:
      return " Rad";
    default:
      return "Unknown unit";
  }
}
