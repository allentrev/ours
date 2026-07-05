import React, { useState, useEffect } from "react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type { Image } from "../../types/galleryTypes";

import type {
  PersonRecord,
  PlaceRecord,
  PlaceOptions,
} from "../../types/familyTypes";

import PlaceSelectorModal from "./SelectorPlaceModal";
import GenealogyDatePickerModal from "./GenealogyDatePickerModal";
import PhotoSelectorModal from "./PhotoSelectorModal";


import { fetchFamilyPlaceOptions , getPlaceName } from "../../utilities/Family/utils";

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
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectPlaceModal, setSelectPlaceModal] = useState<{
    open: boolean;
    field: "birthPlaceHandle" | "deathPlaceHandle";
  }>({
    open: false,
    field: "birthPlaceHandle",
  });

  const [dateModal, setDateModal] = useState<{
    open: boolean;
    field: "birthDate" | "deathDate";
  }>({
    open: false,
    field: "birthDate",
  });

  const [placeOptions, setPlaceOptions] =
    useState<PlaceOptions>({
      places: [],
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

  const handlePhotoSelected = (image: Image) => {
  setItem({
    ...item,
    primaryPhotoUrl: image.url,
  });

  setPhotoModalOpen(false);
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

          <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-2 items-center">
          <div />
          <div className="font-semibold text-gray-700">Date</div>
          <div className="font-semibold text-gray-700">Place</div>
          <div />
          <div />

          <div className="font-semibold text-gray-700">Birth</div>
          <>
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="text"
                name="birthDate"
                value={item.birthDate ?? ""}
                onChange={handleChange}
                className="w-full min-w-0 border border-gray-300 rounded px-2 py-1"
              />
              <button
                type="button"
                className="h-9 shrink-0 rounded border border-gray-300 bg-gray-100 px-2 text-sm text-gray-700 hover:bg-gray-200"
                title="Select birth date"
                onClick={() =>
                  setDateModal({
                    open: true,
                    field: "birthDate",
                  })
                }
              >
                Date
              </button>
            </div>
            <input
              type="text"
              name="birthPlaceHandle"
              value={(item.birthPlaceHandle) ? getPlaceName("short", item.birthPlaceHandle, placeOptions.places) : ""}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1"
            />

            <div />

            <div className="flex items-center gap-2">
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
            </div>
          </>
          <div className="font-semibold text-gray-700">Death</div>
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="text"
                name="deathDate"
                value={item.deathDate ?? ""}
                onChange={handleChange}
                className="w-full min-w-0 border border-gray-300 rounded px-2 py-1"
              />
              <button
                type="button"
                className="h-9 shrink-0 rounded border border-gray-300 bg-gray-100 px-2 text-sm text-gray-700 hover:bg-gray-200"
                title="Select death date"
                onClick={() =>
                  setDateModal({
                    open: true,
                    field: "deathDate",
                  })
                }
              >
                Date
              </button>
            </div>
            <input
              type="text"
              name="deathPlaceHandle"
              value={(item.deathPlaceHandle) ? getPlaceName("short", item.deathPlaceHandle, placeOptions.places) : ""}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1"
            />
            <div />
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
              title="Select photo"
              onClick={() => setPhotoModalOpen(true)}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={iconButtonClass}
              title="Remove photo"
              onClick={() =>
                setItem({
                  ...item,
                  primaryPhotoUrl: "",
                })
              }
            >
              <XMarkIcon className="h-5 w-5" />
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

      <GenealogyDatePickerModal
        open={dateModal.open}
        value={item[dateModal.field] ?? ""}
        onClose={() =>
          setDateModal((current) => ({
            ...current,
            open: false,
          }))
        }
        onSelect={(date) => {
          setItem({
            ...item,
            [dateModal.field]: date,
          });

          setDateModal((current) => ({
            ...current,
            open: false,
          }));
        }}
      />
      <PhotoSelectorModal
        open={photoModalOpen}
        currentPhotoUrl={item.primaryPhotoUrl}
        onClose={() => setPhotoModalOpen(false)}
        onSelectPhoto={handlePhotoSelected}
      />
    </form>
  );
};

export default FamilyPersonEditFormArea;