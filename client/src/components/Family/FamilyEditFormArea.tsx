import React from "react";

import type {
  FamilyRecord,
} from "../../types/familyTypes";

//import { readFamily } from "../../utilities/Family/utils";

interface FamilyEditFormAreaProps {
  item: FamilyRecord;
  setItem: (item: FamilyRecord) => void;
  isNew: boolean;
}

const FamilyEditFormArea: React.FC<
  FamilyEditFormAreaProps
> = ({ item, setItem, isNew }) => {
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const updatedItem: FamilyRecord = {
      ...item,
      [name]: value,
    };

    setItem(updatedItem);
  };

  
  return (
    <form
      id="edit-form"
      className="bg-white shadow-md rounded p-4 my-4 space-y-4"
    >
      <h2 className="text-xl font-semibold">
        {isNew ? "Create Family" : "Edit Family"}
      </h2>

      {/* Family */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Family
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            Content:
            <input
              type="text"
              name="text"
              value={item.fatherHandle ?? ""}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </label>
        </div>
      </fieldset>

      {/* Ids */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Ids
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            Handle:
            <input
              type="text"
              value={item.handle}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>

          <label className="flex flex-col">
            Gramps Id:
            <input
              type="text"
              value={item.grampsId}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>
        </div>
      </fieldset>
    </form>
  );
};

export default FamilyEditFormArea;