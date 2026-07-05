import React from "react";

import type {
  NoteRecord,
} from "../../types/familyTypes";

interface NoteEditFormAreaProps {
  item: NoteRecord;
  setItem: (item: NoteRecord) => void;
  isNew: boolean;
}

const NoteEditFormArea: React.FC<
  NoteEditFormAreaProps
> = ({ item, setItem, isNew }) => {
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const updatedItem: NoteRecord = {
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
        {isNew ? "Create Note" : "Edit Note"}
      </h2>

      {/* Note */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Note
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            Content:
            <input
              type="text"
              name="text"
              value={item.text ?? ""}
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

export default NoteEditFormArea;