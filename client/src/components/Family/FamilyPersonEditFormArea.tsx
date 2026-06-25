import React, { useState, useEffect } from "react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import type {
  PersonRecord,
  PlaceRecord,
  PlaceOptions,
} from "../../types/familyTypes";

import PlaceSelectorModal from "./SelectorPlaceModal";
import NewPlaceModal from "./NewPlaceModal";
import { fetchFamilyPlaceOptions } from "../../utilities/Family/utils";

import manOutline from "../../assets/man_outline.jpg";
import womanOutline from "../../assets/woman_outline.jpg";

interface FamilyPersonEditFormAreaProps {
  item: PersonRecord;
  setItem: (item: PersonRecord) => void;
  isNew: boolean;
}

const iconButtonClass =
  "h-9 w-9 rounded border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center";

const FamilyPersonEditFormArea: React.FC<
  FamilyPersonEditFormAreaProps
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

  const displayName = [item.firstName, item.surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  const photoUrl =
    item.primaryPhotoUrl ||
    (item.gender?.toLowerCase() === "male"
      ? manOutline
      : womanOutline);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const updatedItem: PersonRecord = {
      ...item,
      [name]: value,
    };

    if (name === "firstName" || name === "surname") {
      updatedItem.displayName = [
        name === "firstName" ? value : item.firstName,
        name === "surname" ? value : item.surname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
    }

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
        {isNew ? "Create Person" : "Edit Person"}
      </h2>

      {/* Person */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Person
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            First Name:
            <input
              type="text"
              name="firstName"
              value={item.firstName ?? ""}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </label>

          <label className="flex flex-col">
            Surname:
            <input
              type="text"
              name="surname"
              value={item.surname ?? ""}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </label>

          <label className="flex flex-col md:col-span-2">
            Display Name:
            <input
              type="text"
              value={displayName}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>

          <label className="flex flex-col">
            Gender:
            <select
              name="gender"
              value={item.gender ?? "Unknown"}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1 bg-white"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Unknown">Unknown</option>
            </select>
          </label>
        </div>
      </fieldset>

      {/* Events */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Events
        </legend>

        <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-2 items-center">
          <div />
          <div className="font-semibold text-gray-700">Date</div>
          <div className="font-semibold text-gray-700">Place</div>
          <div />
          <div />

          <div className="font-semibold text-gray-700">Birth</div>

          <input
            type="date"
            name="birthDate"
            value={item.birthDate ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1"
          />

          <input
            type="text"
            name="birthPlaceHandle"
            value={item.birthPlaceHandle ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1"
          />

          <button
            type="button"
            className={iconButtonClass}
            title="New birth place"
            onClick={() =>
              setNewPlaceModal({
                open: true,
                field: "birthPlaceHandle",
              })
            }
          >
            <PlusIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            className={iconButtonClass}
            title="Select birth place"
            onClick={() => setSelectPlaceModal({
                open: true,
                field: "birthPlaceHandle",
              })
            }
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          <div className="font-semibold text-gray-700">Death</div>

          <input
            type="date"
            name="deathDate"
            value={item.deathDate ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1"
          />

          <input
            type="text"
            name="deathPlaceHandle"
            value={item.deathPlaceHandle ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-2 py-1"
          />

          <button
            type="button"
            className={iconButtonClass}
            title="New death place"
            onClick={() =>
              setNewPlaceModal({
                open: true,
                field: "deathPlaceHandle",
              })
            }
          >
            <PlusIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            className={iconButtonClass}
            title="Select death place"
            onClick={() =>
              setSelectPlaceModal({
                open: true,
                field: "deathPlaceHandle",
              })
            }
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </fieldset>

      {/* Photo */}
      <fieldset className="border border-gray-300 rounded p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Photo
        </legend>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <label className="flex flex-col flex-1 w-full">
            Photo URL:
            <input
              type="text"
              value={item.primaryPhotoUrl ?? ""}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              className={iconButtonClass}
              title="New photo"
            >
              <PlusIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              className={iconButtonClass}
              title="Select photo"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>

          <img
            src={photoUrl}
            alt={item.displayName || "Person thumbnail"}
            className="h-24 w-24 rounded object-cover border border-gray-300"
          />
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

export default FamilyPersonEditFormArea;