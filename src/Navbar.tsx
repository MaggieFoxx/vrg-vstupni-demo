import React from "react";
import { useUnits } from "./UseUnits";
import { AngleUnit, DistanceUnit } from "../types/UnitEnum";

const Navbar: React.FC = () => {
  const { distanceUnit, setDistanceUnit, angleUnit, setAngleUnit } = useUnits();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img src={"./images/mapPin.png"} alt="App Logo" className="h-10 mr-3" />
        <span className="text-4xl font-bold">VR group app</span>
      </div>
      <div className="flex items-center">
        <div className="mr-4">
          <label className="mr-2">Distance Unit:</label>
          <select
            value={distanceUnit}
            onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
            className="bg-gray-700 text-white p-2 rounded"
          >
            <option value={DistanceUnit.METERS}>Meters</option>
            <option value={DistanceUnit.MILES}>Miles</option>
          </select>
        </div>
        <div>
          <label className="mr-2">Angle Unit:</label>
          <select
            value={angleUnit}
            onChange={(e) => setAngleUnit(e.target.value as AngleUnit)}
            className="bg-gray-700 text-white p-2 rounded"
          >
            <option value={AngleUnit.DEGREES}>Degrees</option>
            <option value={AngleUnit.RADIANS}>Radians</option>
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
