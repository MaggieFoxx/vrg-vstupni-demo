import { LineCoordinates } from "../../types/CoordinatesType";

export const CoordinateInput: React.FC<{
  label: string;
  name: keyof LineCoordinates;
  value: number | string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, onChange }) => (
  <div className="flex flex-col mr-4">
    <label className="mb-2">{label}:</label>
    <input
      type="number"
      name={name}
      value={value !== null ? value : ""}
      onChange={onChange}
      placeholder={label}
      className="border p-2 mb-4 w-full text-black"
    />
  </div>
);
