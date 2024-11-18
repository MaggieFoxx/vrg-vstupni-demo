import { useState, useEffect } from "react";
import { LineCoordinates } from "../../types/CoordinatesType";
import { CoordinateInput } from "./LineCoordinateInput";
import { TooltipButton } from "./TooltipButton";
import { tooltipTexts } from "../TooltipTexts";

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
        <TooltipButton
          type="submit"
          buttonClass="btn btn-green w-full relative text-lg py-2"
          onClick={addLineByCoordinates}
          tooltipId="add-line-tooltip"
          tooltipContent={tooltipTexts.addLineButton}
          buttonText="Add Line"
        />
        <TooltipButton
          type="button"
          buttonClass="btn btn-yellow ml-4 w-full relative text-lg py-2"
          onClick={() => {
            setLineCoordinates(coordinates);
            editLineByCoordinates();
          }}
          tooltipId="edit-line-tooltip"
          tooltipContent={tooltipTexts.editLineButton}
          buttonText="Change line coordinates"
        />
      </div>
    </form>
  );
};
