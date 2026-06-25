import React, { useState, useEffect } from "react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import type {
  PlaceRecord,
  PlaceOptions,
} from "../../types/familyTypes";

import PlaceSelectorModal from "./SelectorPlaceModal";
import NewPlaceModal from "./NewPlaceModal";
import { fetchFamilyPlaceOptions } from "../../utilities/Family/utils";

interface PlaceEditFormAreaProps {
  item: PlaceRecord;
  setItem: (item: PlaceRecord) => void;
  isNew: boolean;
}

const iconButtonClass =
  "h-9 w-9 rounded border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center";

export const PlaceEditFormArea: React.FC<
  PlaceEditFormAreaProps
> = ({ item, setItem, isNew }) => {

  const [selectPlaceModal, setSelectPlaceModal] = useState<{
    open: boolean;
    field: "birthPlaceHandle" | "deathPlaceHandle";
  }>({
    open: false,
    field: "birthPlaceHandle",
  });

  const [newPlaceModal, setNewPlaceModal] = useState<{
    open: boolean;
    field: "birthPlaceHandle" | "deathPlaceHandle";
  }>({
    open: false,
    field: "birthPlaceHandle",
  });

  const [placeOptions, setPlaceOptions] =
    useState<PlaceOptions>({
      urbanAreas: [],
      counties: [],
      countries: [],
    });
  
  useEffect(() => {
    fetchFamilyPlaceOptions()
    .then(setPlaceOptions)
    .catch(console.error)
  }, []);

  const displayPlace = [item.line1, item.line2, item.urbanArea]
    .filter(Boolean)
    .join(" ")
    .trim();

  console.log("DisplayPlace = ", displayPlace);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const updatedItem: PlaceRecord = {
      ...item,
      [name]: value,
    };

    setItem(updatedItem);
  };

  const handlePlaceSelected = (place: PlaceRecord) => {
    setItem({
      ...item,
      [selectPlaceModal.field]: place.handle,
    });

    setSelectPlaceModal((current) => ({
      ...current,
      open: false,
    }));
  };

  const handlePlaceCreated = (
    place: PlaceRecord,
    options: PlaceOptions
  ) => {
    setItem({
      ...item,
      [newPlaceModal.field]: place.handle,
    });

    setPlaceOptions(options);

    setNewPlaceModal((current) => ({
      ...current,
      open: false,
    }));
  };

  return (
    <form
      id="edit-form"
      className="bg-white shadow-md rounded p-4 my-4 space-y-4"
    >
      <h2 className="text-xl font-semibold">
        {isNew ? "Create Place" : "Edit Place"}
      </h2>

      {/* Person */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Place
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            Line1:
            <input
              type="text"
              name="firstName"
              value={item.line1 ?? ""}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </label>

          <label className="flex flex-col">
            Line2:
            <input
              type="text"
              name="line2"
              value={item.line2 ?? ""}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </label>

          <label className="flex flex-col md:col-span-2">
            Village/Town/City:
            <input
              type="text"
              value={item.urbanArea}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>

          <label className="flex flex-col">
            County:
            <input
              type="text"
              value={item.county}
              className="border border-gray-300 rounded px-2 py-1 bg-white"
            />
          </label>
        </div>
      </fieldset>

      {/* Other */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Other
        </legend>

        <div className="flex items-end gap-2">
          <label className="flex flex-col w-24">
            Notes:
            <input
              type="text"
              value={item.noteHandles?.length ?? 0}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>

          <button
            type="button"
            className={iconButtonClass}
            title="New note"
          >
            <PlusIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            className={iconButtonClass}
            title="Select note"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
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

      <PlaceSelectorModal
        open={selectPlaceModal.open}
        onClose={() =>
          setSelectPlaceModal((current) => ({
            ...current,
            open: false,
          }))
        }
        onSelectPlace={handlePlaceSelected}
      />

      <NewPlaceModal
        open={newPlaceModal.open}
        placeOptions={placeOptions}
        onClose={() =>
          setNewPlaceModal((current) => ({
            ...current,
            open: false,
          }))
        }
        onPlaceCreated={handlePlaceCreated}
      />
    </form>
  );
};

export default PlaceEditFormArea;