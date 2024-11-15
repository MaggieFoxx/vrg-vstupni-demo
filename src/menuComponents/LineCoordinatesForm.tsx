import { useState, useEffect } from "react";
import { LineCoordinates } from "../../types/CoordinatesType";
import { CoordinateInput } from "./LineCoordinateInput";

interface LineCoordinatesInputProps {
  lineCoordinates: LineCoordinates;
  setLineCoordinates: (coordinates: LineCoordinates) => void;
  addLineByCoordinates: () => void;
  editLineByCoordinates: () => void;
}

export const LineCoordinatesForm: React.FC<LineCoordinatesInputProps> = ({
  lineCoordinates,
  setLineCoordinates,
  addLineByCoordinates,
  editLineByCoordinates,
}) => {
  const [coordinates, setCoordinates] =
    useState<LineCoordinates>(lineCoordinates);

  useEffect(() => {
    setCoordinates(lineCoordinates);
  }, [lineCoordinates]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCoordinates((prevCoordinates) => ({
      ...prevCoordinates,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLineCoordinates(coordinates);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row">
        <div className="flex flex-col mr-4">
          <CoordinateInput
            label="Start Longitude"
            name="startLon"
            value={coordinates.startLon}
            onChange={handleChange}
          />
          <CoordinateInput
            label="Start Latitude"
            name="startLat"
            value={coordinates.startLat}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <CoordinateInput
            label="End Longitude"
            name="endLon"
            value={coordinates.endLon}
            onChange={handleChange}
          />
          <CoordinateInput
            label="End Latitude"
            name="endLat"
            value={coordinates.endLat}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex py-3">
        <button
          type="submit"
          className="btn btn-green w-full"
          onClick={addLineByCoordinates}
        >
          Add Line
        </button>
        <button
          type="button"
          className="btn btn-yellow ml-4 w-full"
          onClick={() => {
            setLineCoordinates(coordinates);
            editLineByCoordinates();
          }}
        >
          Change line coordinates
        </button>
      </div>
    </form>
  );
};
