// components/Family/PersonEditFormArea.tsx

import {
  useEffect,
  useState,
} from "react";

import {
  PlusIcon,
} from "@heroicons/react/24/outline";

import type {
  NewNoteInput,
  NoteRecord,
  PersonRecord,
} from "../../types/familyTypes";

import {
  readNote,
} from "../../utilities/Family/utils";

import NewNoteModal from "./NewNoteModal";
import PersonFormCore from "./PersonFormCore";

interface PersonEditFormAreaProps {
  person: Partial<PersonRecord>;
  isNew: boolean;
  draftNotes: NewNoteInput[];

  onChange: (
    person: Partial<PersonRecord>
  ) => void;

  onDraftNotesChange: (
    notes: NewNoteInput[]
  ) => void;
}

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded " +
  "border border-gray-300 bg-gray-100 text-gray-700 " +
  "hover:bg-gray-200";

const PersonEditFormArea = ({
  person,
  isNew,
  draftNotes,
  onChange,
  onDraftNotesChange,
}: PersonEditFormAreaProps) => {
  const [
    newNoteModalOpen,
    setNewNoteModalOpen,
  ] = useState(false);

  const [
    loadingNotes,
    setLoadingNotes,
  ] = useState(false);

  const [
    notes,
    setNotes,
  ] = useState<NoteRecord[]>([]);

  useEffect(() => {
    const noteHandles =
      person.noteHandles ?? [];

    if (noteHandles.length === 0) {
      setNotes([]);
      setLoadingNotes(false);

      return;
    }

    let cancelled = false;

    const loadNotes = async () => {
      try {
        setLoadingNotes(true);

        const loadedNotes =
          await Promise.all(
            noteHandles.map((handle) =>
              readNote(handle)
            )
          );

        if (!cancelled) {
          setNotes(loadedNotes);
        }
      } catch (error) {
        console.error(
          "Failed to load notes",
          error
        );

        if (!cancelled) {
          setNotes([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingNotes(false);
        }
      }
    };

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [person.noteHandles]);

  const handleAddDraftNote = (
    text: string
  ) => {
    onDraftNotesChange([
      ...draftNotes,
      { text },
    ]);
  };

  const displayedNotes = [
    ...notes,

    ...draftNotes.map(
      (note, index) => ({
        handle: `draft-${index}`,
        grampsId: "",
        text: note.text,
      })
    ),
  ];

  return (
    <form
      id="edit-form"
      className="my-4 space-y-4 rounded bg-white p-4 shadow-md"
    >
      <h2 className="text-xl font-semibold">
        {isNew
          ? "Create Person"
          : "Edit Person"}
      </h2>

      <PersonFormCore
        person={person}
        onChange={onChange}
      />

      {/* Notes */}
      <fieldset className="rounded border border-gray-300 p-4">
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
                      "flex gap-2 rounded border p-1 " +
                      (isDraft
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-gray-50")
                    }
                  >
                    <div>
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
          <PlusIcon className="h-5 w-5" />
        </button>
      </fieldset>

      {/* IDs */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend className="px-2 font-semibold text-gray-700">
          IDs
        </legend>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col">
            Handle:
            <input
              type="text"
              value={person.handle ?? ""}
              readOnly
              className="rounded border border-gray-300 bg-gray-100 px-2 py-1"
            />
          </label>

          <label className="flex flex-col">
            Gramps ID:
            <input
              type="text"
              value={person.grampsId ?? ""}
              readOnly
              className="rounded border border-gray-300 bg-gray-100 px-2 py-1"
            />
          </label>
        </div>
      </fieldset>

      <NewNoteModal
        open={newNoteModalOpen}
        onClose={() =>
          setNewNoteModalOpen(false)
        }
        onSave={handleAddDraftNote}
      />
    </form>
  );
};

export default PersonEditFormArea;