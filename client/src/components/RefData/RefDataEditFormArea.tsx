import React from "react";
import type { RefDataRecord } from "../../types/refDataTypes";

interface WebPageOption {
  key: string;
  label: string;
}

interface RefDataEditFormAreaProps {
  item: RefDataRecord;
  setItem: (item: RefDataRecord) => void;
  webPageOptions: WebPageOption[];
  isNew: boolean;
}

const RefDataEditFormArea: React.FC<RefDataEditFormAreaProps> = ({
  item,
  setItem,
  webPageOptions = [],
  isNew,
}) => {

  console.log(webPageOptions);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setItem({
      ...item,
      [name]: value,
    });
  };

  return (
    <form id="edit-form" className="bg-white shadow-md rounded p-4 my-4 space-y-4">
      <h2 className="text-xl font-semibold">{isNew ? "Create RefData" : "Edit RefData"}</h2>

      {/* Web Page */}
      <label className="flex flex-col">
        Web Page:
        {isNew ? (
          <select
            name="webPage"
            value={item.webPage}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="">-- Select Web Page --</option>
            {webPageOptions.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        ) : (
          <div className="font-medium text-gray-700">{item.webPage}</div>
        )}
      </label>

      {/* refKey */}
      <label className="flex flex-col">
        RefKey:
        {isNew ? (
          <input
            type="text"
            name="refKey"
            value={item.refKey}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1"
          />
        ) : (
          <div className="font-medium text-gray-700">{item.refKey}</div>
        )}
      </label>

      {/* Name */}
      <label className="flex flex-col">
        Name:
        {isNew ? (
          <input
            type="text"
            name="name"
            value={item.name}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1"
          />
        ) : (
          <div className="font-medium text-gray-700">{item.name}</div>
        )}
      </label>

      {/* Value */}
      <label className="flex flex-col">
        Value:
        <input
          type="text"
          name="value"
          value={item.value}
          onChange={handleChange}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </label>
    </form>
  );
};

export default RefDataEditFormArea;
