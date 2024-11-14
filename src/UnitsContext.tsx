import React, { createContext, useState, ReactNode } from "react";
import { AngleUnit, DistanceUnit } from "../types/UnitEnum";

interface UnitsContextProps {
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
  angleUnit: AngleUnit;
  setAngleUnit: (unit: AngleUnit) => void;
}

export const UnitsContext = createContext<UnitsContextProps | undefined>(
  undefined
);

export const UnitsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(
    DistanceUnit.METERS
  );
  const [angleUnit, setAngleUnit] = useState<AngleUnit>(AngleUnit.DEGREES);

  return (
    <UnitsContext.Provider
      value={{ distanceUnit, setDistanceUnit, angleUnit, setAngleUnit }}
    >
      {children}
    </UnitsContext.Provider>
  );
};
