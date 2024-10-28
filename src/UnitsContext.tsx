import React, { createContext, useState, useContext, ReactNode } from 'react';

export type DistanceUnit = 'meters' | 'miles';
export type AngleUnit = 'degrees' | 'radians';

interface UnitsContextProps {
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
  angleUnit: AngleUnit;
  setAngleUnit: (unit: AngleUnit) => void;
}

const UnitsContext = createContext<UnitsContextProps | undefined>(undefined);

export const UnitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('meters');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('degrees');

  return (
    <UnitsContext.Provider value={{ distanceUnit, setDistanceUnit, angleUnit, setAngleUnit }}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnits = () => {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error('useUnits must be used within a UnitsProvider');
  }
  return context;
}
