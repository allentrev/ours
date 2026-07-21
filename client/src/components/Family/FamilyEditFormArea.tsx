import React from "react";
import { useEffect, useState, } from "react";

import type {
  FamilyRecord,
  PlaceOptions,
  PlaceRecord,
} from "../../types/familyTypes";

import {
  fetchFamilyPlaceOptions,
  getPlaceName,
} from "../../utilities/Family/utils";

//import { readFamily } from "../../utilities/Family/utils";
import NewPlaceModal from "./NewPlaceModal";
import PlaceSelectorModal from "./SelectorPlaceModal";
import GenealogyDatePickerModal from "./GenealogyDatePickerModal";

import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface FamilyEditFormAreaProps {
  item: FamilyRecord;
  setItem: (item: FamilyRecord) => void;
  isNew: boolean;
}
const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded " +
  "border border-gray-300 bg-gray-100 text-gray-700 " +
  "hover:bg-gray-200";

const FamilyEditFormArea: React.FC<
  FamilyEditFormAreaProps
> = ({ item, setItem, isNew }) => {
  
  const [
    relationshipDateModalOpen,
    setRelationshipDateModalOpen,
  ] = useState(false);

  const [
    selectPlaceModalOpen,
    setSelectPlaceModalOpen,
  ] = useState(false);

  const [
    newPlaceModalOpen,
    setNewPlaceModalOpen,
  ] = useState(false);

  const [
    placeOptions,
    setPlaceOptions,
  ] = useState<PlaceOptions>({
    places: [],
    urbanAreas: [],
    counties: [],
    countries: [],
  });

  useEffect(() => {
    fetchFamilyPlaceOptions()
      .then(setPlaceOptions)
      .catch((error) => {
        console.error(
          "Failed to load place options",
          error
        );
      });
  }, []);

  const handlePlaceSelected = (
    place: PlaceRecord
  ) => {
    setItem({
      ...item,
      relationshipPlaceHandle:
        place.handle,
    });

    setSelectPlaceModalOpen(false);
  };

  const handlePlaceCreated = async (
    place: PlaceRecord
  ) => {
    setItem({
      ...item,
      relationshipPlaceHandle:
        place.handle,
    });

    setPlaceOptions(
      await fetchFamilyPlaceOptions()
    );

    setNewPlaceModalOpen(false);
  };

  const relationshipPlaceName =
    item.relationshipPlaceHandle
      ? getPlaceName(
          "short",
          item.relationshipPlaceHandle,
          placeOptions.places
        )
      : "";

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
  <>
    <form
      id="edit-form"
      className="bg-white shadow-md rounded p-4 my-4 space-y-4"
    >
      <h2 className="text-xl font-semibold">
        {isNew ? "Create Family" : "Edit Family"}
      </h2>

      {/* Family */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Family
        </legend>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col">
            Father Handle:
            <input
              type="text"
              name="fatherHandle"
              value={item.fatherHandle ?? ""}
              onChange={handleChange}
              className="rounded border border-gray-300 px-2 py-1"
            />
          </label>

          <label className="flex flex-col">
            Mother Handle:
            <input
              type="text"
              name="motherHandle"
              value={item.motherHandle ?? ""}
              onChange={handleChange}
              className="rounded border border-gray-300 px-2 py-1"
            />
          </label>

          <label className="flex flex-col">
            Relationship Type:
            <select
              name="relationshipType"
              value={item.relationshipType ?? "Unknown"}
              onChange={handleChange}
              className="rounded border border-gray-300 bg-white px-2 py-1"
            >
              <option value="Unknown">Unknown</option>
              <option value="Married">Married</option>
              <option value="Unmarried">Unmarried</option>
              <option value="Civil Union">Civil Union</option>
              <option value="Divorced">Divorced</option>
            </select>
          </label>

          <label className="flex flex-col">
            Relationship Date:

            <div className="flex min-w-0 items-center gap-2">
              <input
                type="text"
                name="relationshipDate"
                value={
                  item.relationshipDate ?? ""
                }
                onChange={handleChange}
                className="w-full min-w-0 rounded border border-gray-300 px-2 py-1"
              />

              <button
                type="button"
                title="Select relationship date"
                onClick={() =>
                  setRelationshipDateModalOpen(
                    true
                  )
                }
                className="h-9 shrink-0 rounded border border-gray-300 bg-gray-100 px-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Date
              </button>
            </div>
          </label>

          <label className="flex flex-col md:col-span-2">
            Relationship Place:

            <div className="flex min-w-0 items-center gap-2">
              <input
                type="text"
                value={relationshipPlaceName}
                readOnly
                className="w-full min-w-0 rounded border border-gray-300 bg-gray-100 px-2 py-1"
              />

              <button
                type="button"
                title="Select existing relationship place"
                onClick={() =>
                  setSelectPlaceModalOpen(true)
                }
                className={iconButtonClass}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              <button
                type="button"
                title="Create new relationship place"
                onClick={() =>
                  setNewPlaceModalOpen(true)
                }
                className={iconButtonClass}
              >
                +
              </button>
            </div>
          </label>
        </div>
      </fieldset>
      {/* Children */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Children
        </legend>

        {item.childHandles && item.childHandles.length > 0 ? (
          <div className="space-y-2">
            {item.childHandles.map((handle) => (
              <div
                key={handle}
                className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              >
                {handle}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No children recorded.
          </p>
        )}
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
    <PlaceSelectorModal
      open={selectPlaceModalOpen}
      onClose={() =>
        setSelectPlaceModalOpen(false)
      }
      onSelectPlace={
        handlePlaceSelected
      }
    />

    <NewPlaceModal
      open={newPlaceModalOpen}
      placeOptions={placeOptions}
      onClose={() =>
        setNewPlaceModalOpen(false)
      }
      onPlaceCreated={
        handlePlaceCreated
      }
    />

    <GenealogyDatePickerModal
      open={relationshipDateModalOpen}
      value={
        item.relationshipDate ?? ""
      }
      onClose={() =>
        setRelationshipDateModalOpen(
          false
        )
      }
      onSelect={(date) => {
        setItem({
          ...item,
          relationshipDate: date,
        });

        setRelationshipDateModalOpen(
          false
        );
      }}
    />      
  </>
  );
};

export default FamilyEditFormArea;