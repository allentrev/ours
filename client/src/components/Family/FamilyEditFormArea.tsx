import {
  useEffect,
  useState,
  type ChangeEvent,
  type FC,
} from "react";

import type {
  PersonRecord,
  PersonActor,
  FamilyRecord,
  PlaceOptions,
  PlaceRecord,
  NewNoteInput,
  NoteRecord,
} from "../../types/familyTypes";

import {
  fetchFamilyPlaceOptions,
  getPlaceName,
} from "../../utilities/Family/utils";

//import { readFamily } from "../../utilities/Family/utils";
import NewPlaceModal from "./NewPlaceModal";
import NewNoteModal from "./NewNoteModal";
import PlaceSelectorModal from "./PlaceSelectorModal";
import GenealogyDatePickerModal from "./GenealogyDatePickerModal";
import PersonSelectorModal from "./PersonSelectorModal";

import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface FamilyEditFormAreaProps {
  item: FamilyRecord;
  setItem: (item: FamilyRecord) => void;
  isNew: boolean;

  fatherName?: string;
  motherName?: string;

  childActors?: PersonActor[];
  existingNotes?: NoteRecord[];
  draftNotes?: NewNoteInput[];
  
  onCreateChild?: () => void;
  onChildActorsChange?: (
    children: PersonActor[]
  ) => void;
  onDraftNotesChange?: (
    notes: NewNoteInput[]
  ) => void;
}
const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded " +
  "border border-gray-300 bg-gray-100 text-gray-700 " +
  "hover:bg-gray-200";

const FamilyEditFormArea: FC<
  FamilyEditFormAreaProps
> = ({
    item,
    setItem,
    isNew,
    childActors = [],
    existingNotes = [],
    draftNotes = [],
    fatherName,
    motherName,
    onCreateChild = () => {},
    onChildActorsChange = () => {},
    onDraftNotesChange = () => {},
}) => {
  
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

  const [
    newNoteModalOpen,
    setNewNoteModalOpen,
  ] = useState(false);

  const [
    parentSelector,
    setParentSelector,
  ] = useState<{
    open: boolean;
    field:
      | "fatherHandle"
      | "motherHandle";
  }>({
    open: false,
    field: "fatherHandle",
  });

  const [
    selectedFatherName,
    setSelectedFatherName,
  ] = useState(fatherName ?? "");

  const [
    selectedMotherName,
    setSelectedMotherName,
  ] = useState(motherName ?? "");

  const [
    childSelectorOpen,
    setChildSelectorOpen,
  ] = useState(false);

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

  useEffect(() => {
    setSelectedFatherName(
      fatherName ?? ""
    );

    setSelectedMotherName(
      motherName ?? ""
    );
  }, [
    fatherName,
    motherName,
  ]);

  const handleChildSelected = (
    person: PersonRecord
  ) => {
    if (
      item.childHandles?.includes(
        person.handle
      )
    ) {
      setChildSelectorOpen(false);
      return;
    }

    setItem({
      ...item,
      childHandles: [
        ...(item.childHandles ?? []),
        person.handle,
      ],
    });

    onChildActorsChange([
      ...childActors,
      {
        handle: person.handle,
        displayName:
          person.displayName,
      },
    ]);

    setChildSelectorOpen(false);
  };

  const handleRemoveChild = (
    childHandle: string
  ) => {
    setItem({
      ...item,
      childHandles:
        (item.childHandles ?? [])
          .filter(
            (handle) =>
              handle !== childHandle
          ),
    });

    onChildActorsChange(
      childActors.filter(
        (child) =>
          child.handle !== childHandle
      )
    );
  };

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

  const handlePlaceCreated = (
    place: PlaceRecord,
    options: PlaceOptions
  ) => {
    setItem({
      ...item,
      relationshipPlaceHandle:
        place.handle,
    });

    setPlaceOptions(options);
    setNewPlaceModalOpen(false);
  };

  const handleAddDraftNote = (
    text: string
  ) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    onDraftNotesChange([
      ...draftNotes,
      {
        text: trimmedText,
      },
    ]);

    setNewNoteModalOpen(false);
  };

  const displayedNotes = [
    ...existingNotes,

    ...draftNotes.map(
      (note, index) => ({
        handle: `draft-${index}`,
        grampsId: "",
        text: note.text,
      })
    ),
  ];

  const relationshipPlaceName =
    item.relationshipPlaceHandle
      ? getPlaceName(
          "short",
          item.relationshipPlaceHandle,
          placeOptions.places
        )
      : "";

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    const updatedItem: FamilyRecord = {
      ...item,
      [name]: value,
    };

    setItem(updatedItem);
  };

  const handleParentSelected = (
    person: PersonRecord
  ) => {
    setItem({
      ...item,
      [parentSelector.field]:
        person.handle,
    });

    if (
      parentSelector.field ===
      "fatherHandle"
    ) {
      setSelectedFatherName(
        person.displayName
      );
    } else {
      setSelectedMotherName(
        person.displayName
      );
    }

    setParentSelector((current) => ({
      ...current,
      open: false,
    }));
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
            Father:

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedFatherName}
                readOnly
                className="
                  w-full rounded
                  border border-gray-300
                  bg-gray-100 px-2 py-1
                "
              />

              <button
                type="button"
                title="Select father"
                onClick={() =>
                  setParentSelector({
                    open: true,
                    field: "fatherHandle",
                  })
                }
                className={iconButtonClass}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              <button
                type="button"
                title="Remove father"
                onClick={() => {
                  setItem({
                    ...item,
                    fatherHandle: undefined,
                  });

                  setSelectedFatherName("");
                }}
                className={iconButtonClass}
              >
                ×
              </button>

            </div>
          </label>

          <label className="flex flex-col">
            Mother:

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedMotherName}
                readOnly
                className="
                  w-full rounded
                  border border-gray-300
                  bg-gray-100 px-2 py-1
                "
              />

              <button
                type="button"
                title="Select mother"
                onClick={() =>
                  setParentSelector({
                    open: true,
                    field: "motherHandle",
                  })
                }
                className={iconButtonClass}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              <button
                type="button"
                title="Remove mother"
                onClick={() => {
                  setItem({
                    ...item,
                    motherHandle: undefined,
                  });

                  setSelectedMotherName("");
                }}
                className={iconButtonClass}
              >
                ×
              </button>

            </div>
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
                  item.relationshipDate?.text ?? ""
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

        {childActors.length > 0 ? (
          <div className="space-y-2">
            {childActors.map((child) => (
              <div
                key={child.handle}
                className="
                  flex items-center
                  justify-between gap-3
                  rounded border
                  border-gray-200
                  bg-gray-50
                  px-3 py-2
                "
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-gray-800">
                    {child.displayName}
                  </div>

                  <div className="text-xs text-gray-500">
                    {child.handle}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleRemoveChild(
                      child.handle
                    )
                  }
                  className="
                    shrink-0 rounded
                    border border-red-300
                    px-3 py-1
                    text-xs text-red-700
                    hover:bg-red-50
                  "
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No children recorded.
          </p>
        )}

        <button
          type="button"
          onClick={() =>
            setChildSelectorOpen(true)
          }
          className="
            mt-3 rounded
            bg-blue-600
            px-3 py-2
            text-sm text-white
            hover:bg-blue-700
          "
        >
          Add Existing Child
        </button>

        <button
          type="button"
          onClick={onCreateChild}
          className="
            rounded bg-blue-600
            px-3 py-2
            text-sm text-white
            hover:bg-blue-700
          "
        >
          New Child
        </button>

      </fieldset>

      {/* Notes */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend className="px-2 font-semibold text-gray-700">
          Notes
        </legend>

        {displayedNotes.length === 0 ? (
          <div className="text-sm text-gray-500">
            No Notes found
          </div>
        ) : (
          <div className="max-h-48 space-y-1 overflow-y-auto pr-2 text-sm text-gray-700">
            {displayedNotes.map(
              (note, index) => {
                const isDraft =
                  note.handle.startsWith(
                    "draft-"
                  );

                return (
                  <div
                    key={note.handle}
                    className={
                      "flex items-start gap-2 rounded border p-1 " +
                      (isDraft
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-gray-50")
                    }
                  >
                    <div>
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1 whitespace-pre-wrap">
                      {note.text}

                      {isDraft && (
                        <span className="ml-2 text-xs text-blue-600">
                          unsaved
                        </span>
                      )}
                    </div>

                    {isDraft && (
                      <button
                        type="button"
                        onClick={() => {
                          const draftIndex =
                            Number(
                              note.handle.replace(
                                "draft-",
                                ""
                              )
                            );

                          onDraftNotesChange(
                            draftNotes.filter(
                              (_, index) =>
                                index !== draftIndex
                            )
                          );
                        }}
                        className="shrink-0 px-2 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}

        <button
          type="button"
          title="Add Note"
          onClick={() =>
            setNewNoteModalOpen(true)
          }
          className={`${iconButtonClass} mt-3`}
        >
          +
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
              value={item.handle ?? ""}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>

          <label className="flex flex-col">
            Gramps Id:
            <input
              type="text"
              value={item.grampsId ?? ""}
              readOnly
              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
            />
          </label>
        </div>
      </fieldset>
    </form>
    <PersonSelectorModal
      open={childSelectorOpen}
      title="Select Child"
      excludeHandles={[
        ...(item.childHandles ?? []),
        item.fatherHandle,
        item.motherHandle,
      ].filter(
        (handle): handle is string =>
          Boolean(handle)
      )}
      onClose={() =>
        setChildSelectorOpen(false)
      }
      onSelectPerson={
        handleChildSelected
      }
    />

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
    <NewNoteModal
      open={newNoteModalOpen}
      onClose={() =>
        setNewNoteModalOpen(false)
      }
      onSave={handleAddDraftNote}
    />

    <PersonSelectorModal
      open={parentSelector.open}
      title={
        parentSelector.field ===
        "fatherHandle"
          ? "Select Father"
          : "Select Mother"
      }
      excludeHandles={[
        parentSelector.field ===
        "fatherHandle"
          ? item.motherHandle
          : item.fatherHandle,
      ].filter(
        (handle): handle is string =>
          Boolean(handle)
      )}
      onClose={() =>
        setParentSelector(
          (current) => ({
            ...current,
            open: false,
          })
        )
      }
      onSelectPerson={
        handleParentSelected
      }
    />

    <GenealogyDatePickerModal
      open={relationshipDateModalOpen}
      value={
        item.relationshipDate
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