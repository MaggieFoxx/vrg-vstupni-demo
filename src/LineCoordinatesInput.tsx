import { useState, useEffect } from "react";

export interface LineCoordinates {
  startLon: number;
  startLat: number;
  endLon: number;
  endLat: number;
}

interface LineCoordinatesInputProps {
  lineCoordinates: LineCoordinates;
  setLineCoordinates: (coordinates: LineCoordinates) => void;
  addLineByCoordinates: () => void;
  editLineByCoordinates: () => void;
}

export const LineCoordinatesInput: React.FC<LineCoordinatesInputProps> = ({
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
          <label className="mb-2">Start Longitude:</label>
          <input
            type="text"
            name="startLon"
            value={coordinates.startLon}
            onChange={handleChange}
            placeholder="Start Longitude"
            className="border p-2 mb-4 w-full text-black"
          />
          <label className="mb-2">Start Latitude:</label>
          <input
            type="text"
            name="startLat"
            value={coordinates.startLat}
            onChange={handleChange}
            placeholder="Start Latitude"
            className="border p-2 mb-4  w-full text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2">End Longitude:</label>
          <input
            type="text"
            name="endLon"
            value={coordinates.endLon}
            onChange={handleChange}
            placeholder="End Longitude"
            className="border p-2 mb-4  w-full text-black"
          />
          <label className="mb-2">End Latitude:</label>
          <input
            type="text"
            name="endLat"
            value={coordinates.endLat}
            onChange={handleChange}
            placeholder="End Latitude"
            className="border p-2 mb-4 w-full text-black"
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
