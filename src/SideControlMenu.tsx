import React from "react";
import { LineCoordinates, LineCoordinatesInput } from "./LineCoordinatesInput";

interface SideControlMenuProps {
  location: string;
  setLocation: (location: string) => void;
  handleSearch: () => void;
  addMeasureInteraction: () => void;
  addAngleInteraction: () => void;
  enableDeleteMode: () => void;
  enableEditMode: () => void;
  lineCoordinates: LineCoordinates;
  setLineCoordinates: (coordinates: LineCoordinates) => void;
  addLineByCoordinates: () => void;
  updateLineOnMap: () => void;
}

const SideControlMenu: React.FC<SideControlMenuProps> = ({
  location,
  setLocation,
  handleSearch,
  addMeasureInteraction,
  addAngleInteraction,
  enableDeleteMode,
  enableEditMode,
  lineCoordinates,
  setLineCoordinates,
  addLineByCoordinates,
  updateLineOnMap,
}) => {
  return (
    <div className="h-full bg-gray-800 text-white p-4 flex flex-col justify-between">
      <div>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
          className="border p-2 mb-4 w-full text-black"
        />
        <button className="btn w-full mb-2" onClick={handleSearch}>
          Search location
        </button>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Add new measurements:</h2>
        <div className="flex flex-col md:flex-row my-5">
          <button
            className="btn btn-green w-full mb-2 md:mb-0 md:mr-2"
            onClick={addMeasureInteraction}
          >
            Measure distance
          </button>
          <button
            className="btn btn-blue w-full"
            onClick={addAngleInteraction}
          >
            Measure angle
          </button>
        </div>
      </div>
      <button className="btn btn-red w-full mb-2" onClick={enableDeleteMode}>
        Delete measurement
      </button>
      <button className="btn btn-yellow w-full mb-2" onClick={enableEditMode}>
        Edit line
      </button>
      <div>
        <h1 className="text-xl font-semibold mb-5">
          New measurement by coordinates:
        </h1>
        <LineCoordinatesInput
          lineCoordinates={lineCoordinates}
          setLineCoordinates={setLineCoordinates}
          addLineByCoordinates={addLineByCoordinates}
          editLineByCoordinates={updateLineOnMap}
        />
      </div>
    </div>
  );
};

export default SideControlMenu;