import { useContext } from 'react';
import { UnitsContext } from './UnitsContext';


export const useUnits = () => {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error('useUnits must be used within a UnitsProvider');
  }
  console.log("context");
  console.log(context);
  return context;
}