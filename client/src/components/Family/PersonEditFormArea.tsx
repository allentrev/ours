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
  NoteRecord,
  NewNoteInput,
} from "../../types/familyTypes";

import NewNoteModal from "./NewNoteModal";
import PlaceSelectorModal from "./SelectorPlaceModal";
import GenealogyDatePickerModal from "./GenealogyDatePickerModal";
import PhotoSelectorModal from "./PhotoSelectorModal";


import { fetchFamilyPlaceOptions , getPlaceName, readNote } from "../../utilities/Family/utils";

import manOutline from "../../assets/man_outline.jpg";
import womanOutline from "../../assets/woman_outline.jpg";

interface PersonEditFormAreaProps {
  person: Partial<PersonRecord>;
  isNew: boolean;
  draftNotes: NewNoteInput[];
  onChange: (person: Partial<PersonRecord>) => void;
  onDraftNotesChange: (notes: NewNoteInput[]) => void;
}

const iconButtonClass =
  "h-9 w-9 rounded border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center";

const PersonEditFormArea: React.FC<
  PersonEditFormAreaProps
> = ({
  person,
  isNew,
  draftNotes,
  onChange,
  onDraftNotesChange,
}) => {
  const [newNoteModalOpen, setNewNoteModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
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

  useEffect(() => {
    if (!person?.noteHandles?.length) {
      setNotes([]);
      return;
    }

    const noteHandles = person.noteHandles ?? [];
    //console.log("No of Notes found = ", noteHandles.length);

    const loadNotes = async () => {
      try {
        setLoadingNotes(true);

        const loadedNotes = await Promise.all(
          noteHandles.map((handle) => readNote(handle))
        );

        setNotes(loadedNotes);
      } catch (error) {
        console.error("Failed to load notes", error);
        setNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    loadNotes();
  }, [person]);

  const displayName = [person.firstName, person.surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  const photoUrl =
    person.primaryPhotoUrl ||
    (person.gender?.toLowerCase() === "male"
      ? manOutline
      : womanOutline);

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  const updatedPerson: Partial<PersonRecord> = {
    ...person,
    [name]: value,
  };

  if (name === "firstName" || name === "surname") {
    updatedPerson.displayName = [
      name === "firstName" ? value : person.firstName,
      name === "surname" ? value : person.surname,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  onChange(updatedPerson);
};

const handlePlaceSelected = (place: PlaceRecord) => {
  onChange({
    ...person,
    [selectPlaceModal.field]: place.handle,
  });

  setSelectPlaceModal((current) => ({
    ...current,
    open: false,
  }));
};

const handlePhotoSelected = (image: Image) => {
  onChange({
    ...person,
    primaryPhotoUrl: image.url,
  });

  setPhotoModalOpen(false);
};

const handleAddDraftNote = (text: string) => {
  onDraftNotesChange([
    ...draftNotes,
    { text },
  ]);
};
  
const displayedNotes = [
  ...notes,
  ...draftNotes.map((note, index) => ({
    handle: `draft-${index}`,
    text: note.text,
  })),
];

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
              value={person.firstName ?? ""}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </label>

          <label className="flex flex-col">
            Surname:
            <input
              type="text"
              name="surname"
              value={person.surname ?? ""}
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
              value={person.gender ?? "Unknown"}
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
                value={person.birthDate ?? ""}
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
              value={(person.birthPlaceHandle) ? getPlaceName("short", person.birthPlaceHandle, placeOptions.places) : ""}
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
                value={person.deathDate ?? ""}
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
              value={(person.deathPlaceHandle) ? getPlaceName("short", person.deathPlaceHandle, placeOptions.places) : ""}
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
              value={person.primaryPhotoUrl ?? ""}
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
                onChange({
                  ...person,
                  primaryPhotoUrl: "",
                })
              }
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <img
            src={photoUrl}
            alt={person.displayName || "Person thumbnail"}
            className="h-24 w-24 rounded object-cover border border-gray-300"
          />
        </div>
      </fieldset>

      {/* Notes */}
      <fieldset className="mt-4 rounded border border-gray-300 p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Notes
        </legend>

        {loadingNotes ? (
          <div className="text-sm text-gray-500">
            Loading notes...
          </div>
        ) : displayedNotes.length === 0 ? (
          <div className="text-sm text-gray-500">
            No Notes found
          </div>
        ) : (
          <div className="max-h-48 space-y-1 overflow-y-auto pr-2 text-sm text-gray-700">
            {displayedNotes.map((note, index) => {
              const isDraft = note.handle.startsWith("draft-");

              return (
                <div 
                  key={note.handle}
                  className={`flex flex-row gap-2 rounded border p-1 ${
                    isDraft
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {index + 1}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {note.text}
                    {isDraft && (
                      <span className="ml-2 text-xs text-blue-600">
                        unsaved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <button
          type="button"
          className={iconButtonClass}
          title="Add Note"
          onClick={() => setNewNoteModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
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
              value={person.handle}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>

          <label className="flex flex-col">
            Gramps Id:
            <input
              type="text"
              value={person.grampsId}
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
        value={person[dateModal.field] ?? ""}
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
        currentPhotoUrl={person.primaryPhotoUrl}
        onClose={() => setPhotoModalOpen(false)}
        onSelectPhoto={handlePhotoSelected}
      />
      <NewNoteModal
        open={newNoteModalOpen}
        onClose={() => setNewNoteModalOpen(false)}
        onSave={handleAddDraftNote}
      />
    </form>
  );
};

export default PersonEditFormArea;