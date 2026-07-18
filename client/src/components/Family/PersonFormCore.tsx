// components/Family/PersonFormCore.tsx

import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import {
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type { Image } from "../../types/galleryTypes";

import type {
  PersonRecord,
  PlaceOptions,
  PlaceRecord,
} from "../../types/familyTypes";

import {
  fetchFamilyPlaceOptions,
  getPlaceName,
} from "../../utilities/Family/utils";

import PlaceSelectorModal from "./SelectorPlaceModal";
import GenealogyDatePickerModal from "./GenealogyDatePickerModal";
import PhotoSelectorModal from "./PhotoSelectorModal";

import manOutline from "../../assets/man_outline.jpg";
import womanOutline from "../../assets/woman_outline.jpg";

interface PersonFormCoreProps {
  person: Partial<PersonRecord>;

  onChange: (
    person: Partial<PersonRecord>
  ) => void;
}

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded " +
  "border border-gray-300 bg-gray-100 text-gray-700 " +
  "hover:bg-gray-200";

const PersonFormCore = ({
  person,
  onChange,
}: PersonFormCoreProps) => {
  const [
    photoModalOpen,
    setPhotoModalOpen,
  ] = useState(false);

  const [
    selectPlaceModal,
    setSelectPlaceModal,
  ] = useState<{
    open: boolean;
    field:
      | "birthPlaceHandle"
      | "deathPlaceHandle";
  }>({
    open: false,
    field: "birthPlaceHandle",
  });

  const [
    dateModal,
    setDateModal,
  ] = useState<{
    open: boolean;
    field: "birthDate" | "deathDate";
  }>({
    open: false,
    field: "birthDate",
  });

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

  const displayName = [
    person.firstName,
    person.surname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const photoUrl =
    person.primaryPhotoUrl ||
    (person.gender?.toLowerCase() === "male"
      ? manOutline
      : womanOutline);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = event.target;

    const updatedPerson: Partial<PersonRecord> = {
      ...person,
      [name]: value,
    };

    if (
      name === "firstName" ||
      name === "surname"
    ) {
      updatedPerson.displayName = [
        name === "firstName"
          ? value
          : person.firstName,

        name === "surname"
          ? value
          : person.surname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
    }

    onChange(updatedPerson);
  };

  const handlePlaceSelected = (
    place: PlaceRecord
  ) => {
    onChange({
      ...person,
      [selectPlaceModal.field]:
        place.handle,
    });

    setSelectPlaceModal((current) => ({
      ...current,
      open: false,
    }));
  };

  const handlePhotoSelected = (
    image: Image
  ) => {
    onChange({
      ...person,
      primaryPhotoUrl: image.url,
    });

    setPhotoModalOpen(false);
  };

  const birthPlaceName =
    person.birthPlaceHandle
      ? getPlaceName(
          "short",
          person.birthPlaceHandle,
          placeOptions.places
        )
      : "";

  const deathPlaceName =
    person.deathPlaceHandle
      ? getPlaceName(
          "short",
          person.deathPlaceHandle,
          placeOptions.places
        )
      : "";

  return (
    <>
      {/* Person */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Person
        </legend>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col">
            First Name:
            <input
              type="text"
              name="firstName"
              value={person.firstName ?? ""}
              onChange={handleChange}
              className="rounded border border-gray-300 px-2 py-1"
            />
          </label>

          <label className="flex flex-col">
            Surname:
            <input
              type="text"
              name="surname"
              value={person.surname ?? ""}
              onChange={handleChange}
              className="rounded border border-gray-300 px-2 py-1"
            />
          </label>

          <label className="flex flex-col md:col-span-2">
            Display Name:
            <input
              type="text"
              value={displayName}
              readOnly
              className="rounded border border-gray-300 bg-gray-100 px-2 py-1"
            />
          </label>

          <label className="flex flex-col">
            Gender:
            <select
              name="gender"
              value={
                person.gender ??
                "Unknown"
              }
              onChange={handleChange}
              className="rounded border border-gray-300 bg-white px-2 py-1"
            >
              <option value="Female">
                Female
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Unknown">
                Unknown
              </option>
            </select>
          </label>
        </div>
      </fieldset>

      {/* Events */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Events
        </legend>

        <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2">
          <div />

          <div className="font-semibold text-gray-700">
            Date
          </div>

          <div className="font-semibold text-gray-700">
            Place
          </div>

          <div />

          {/* Birth */}
          <div className="font-semibold text-gray-700">
            Birth
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <input
              type="text"
              name="birthDate"
              value={person.birthDate ?? ""}
              onChange={handleChange}
              className="w-full min-w-0 rounded border border-gray-300 px-2 py-1"
            />

            <button
              type="button"
              title="Select birth date"
              onClick={() =>
                setDateModal({
                  open: true,
                  field: "birthDate",
                })
              }
              className="h-9 shrink-0 rounded border border-gray-300 bg-gray-100 px-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Date
            </button>
          </div>

          <input
            type="text"
            value={birthPlaceName}
            readOnly
            className="rounded border border-gray-300 bg-gray-100 px-2 py-1"
          />

          <button
            type="button"
            title="Select birth place"
            onClick={() =>
              setSelectPlaceModal({
                open: true,
                field:
                  "birthPlaceHandle",
              })
            }
            className={iconButtonClass}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          {/* Death */}
          <div className="font-semibold text-gray-700">
            Death
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <input
              type="text"
              name="deathDate"
              value={person.deathDate ?? ""}
              onChange={handleChange}
              className="w-full min-w-0 rounded border border-gray-300 px-2 py-1"
            />

            <button
              type="button"
              title="Select death date"
              onClick={() =>
                setDateModal({
                  open: true,
                  field: "deathDate",
                })
              }
              className="h-9 shrink-0 rounded border border-gray-300 bg-gray-100 px-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Date
            </button>
          </div>

          <input
            type="text"
            value={deathPlaceName}
            readOnly
            className="rounded border border-gray-300 bg-gray-100 px-2 py-1"
          />

          <button
            type="button"
            title="Select death place"
            onClick={() =>
              setSelectPlaceModal({
                open: true,
                field:
                  "deathPlaceHandle",
              })
            }
            className={iconButtonClass}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </fieldset>

      {/* Photo */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Photo
        </legend>

        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <label className="flex w-full flex-1 flex-col">
            <input
              type="text"
              value={
                person.primaryPhotoUrl ??
                ""
              }
              readOnly
              className="rounded border border-gray-300 bg-gray-100 px-2 py-1"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              title="Select photo"
              onClick={() =>
                setPhotoModalOpen(true)
              }
              className={iconButtonClass}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              title="Remove photo"
              onClick={() =>
                onChange({
                  ...person,
                  primaryPhotoUrl: "",
                })
              }
              className={iconButtonClass}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <img
            src={photoUrl}
            alt={
              person.displayName ||
              "Person Photo"
            }
            className="h-24 w-24 rounded border border-gray-300 object-cover"
          />
        </div>
      </fieldset>

      <PlaceSelectorModal
        open={selectPlaceModal.open}
        onClose={() =>
          setSelectPlaceModal(
            (current) => ({
              ...current,
              open: false,
            })
          )
        }
        onSelectPlace={
          handlePlaceSelected
        }
      />

      <GenealogyDatePickerModal
        open={dateModal.open}
        value={
          person[dateModal.field] ??
          ""
        }
        onClose={() =>
          setDateModal((current) => ({
            ...current,
            open: false,
          }))
        }
        onSelect={(date) => {
          onChange({
            ...person,
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
        currentPhotoUrl={
          person.primaryPhotoUrl
        }
        onClose={() =>
          setPhotoModalOpen(false)
        }
        onSelectPhoto={
          handlePhotoSelected
        }
      />
    </>
  );
};

export default PersonFormCore;
