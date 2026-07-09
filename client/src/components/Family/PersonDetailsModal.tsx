import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import type {
  TreePerson,
  PersonRecord,
  PlaceOptions,
  NoteRecord,
  NewNoteInput,
} from "../../types/familyTypes";

import {
  fetchFamilyPlaceOptions,
  readPerson,



  getPlaceName,
  readNote,
  updatePerson,
} from "../../utilities/Family/utils";

import { formatPersonDate } from "../../utilities/Family/formatters";

import PersonEditModal from "./PersonEditModal";

interface PersonDetailsModalProps {
  open: boolean;
  person: TreePerson | null;
  onClose: () => void;
  onPersonUpdated?: (person: PersonRecord) => void;
}

const modName = "/components/Family/PersonDetailsModal/";

const PersonDetailsModal = ({
  open,
  person,
  onClose,
  onPersonUpdated,
}: PersonDetailsModalProps) => {
  const { getToken } = useAuth();

  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [notes, setNotes] = useState<NoteRecord[]>([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] =
    useState<PersonRecord | null>(null);

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
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!open || !person?.noteHandles?.length) {
      setNotes([]);
      return;
    }

    const noteHandles = person.noteHandles ?? [];

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
  }, [open, person]);

  if (!open || !person) return null;

  const isLiving = !person.deathDate;
  const hasPhoto = Boolean(person.primaryPhotoUrl);

  const hasEvents = Boolean(
    person.birthDate ||
    person.birthPlaceHandle ||
    person.deathDate ||
    person.deathPlaceHandle
  );

  const handleEdit = async () => {
    const funcName = "handleEdit";

    try {
      setLoadingEdit(true);

      const fullPerson = await readPerson(person.handle);

      setEditItem(fullPerson);
      setEditModalOpen(true);
    } catch (error) {
      console.error(
        `${modName}${funcName} Failed to load person for editing`,
        error
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleSaveEdit = async (
    updatedPerson: PersonRecord,
    draftNotes: NewNoteInput[]
  ): Promise<PersonRecord> => {
    const token = await getToken();

    const savedPerson = await updatePerson(
      updatedPerson,
      draftNotes,
      token,
    );

    setEditItem(savedPerson);
    onPersonUpdated?.(savedPerson);

    return savedPerson;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="flex max-h-[85vh] w-[700px] max-w-[95vw] flex-col rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {person.displayName}
            </h2>

            <button
              type="button"
              title="Edit person"
              onClick={handleEdit}
              disabled={loadingEdit }
              className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <PencilSquareIcon className="h-6 w-6 text-blue-600" />
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="mb-4 flex justify-center">
              {hasPhoto ? (
                <img
                  src={person.primaryPhotoUrl}
                  alt={person.displayName}
                  className="h-48 w-48 rounded-lg border border-gray-300 object-cover shadow"
                />
              ) : (
                <div className="text-sm text-gray-500">
                  No Photo Available
                </div>
              )}
            </div>

            <fieldset className="mt-4 rounded border border-gray-300 p-4">
              <legend className="px-2 font-semibold text-gray-700">
                Events
              </legend>

              {!hasEvents ? (
                <div className="text-sm text-gray-500">
                  No events found
                </div>
              ) : (
                <div className="grid grid-cols-[auto_1fr_2fr] gap-x-4 gap-y-2 text-sm">
                  <div />
                  <div className="font-semibold text-gray-700">
                    Date
                  </div>
                  <div className="font-semibold text-gray-700">
                    Place
                  </div>

                  {(person.birthDate || person.birthPlaceHandle) && (
                    <>
                      <div className="font-medium">Birth</div>
                      <div>
                        {person.birthDate
                          ? formatPersonDate(
                              person.birthDate,
                              isLiving
                            )
                          : "-"}
                      </div>
                      <div>
                        {person.birthPlaceHandle
                          ? getPlaceName(
                              "short",
                              person.birthPlaceHandle,
                              placeOptions.places
                            )
                          : "-"}
                      </div>
                    </>
                  )}

                  {(person.deathDate || person.deathPlaceHandle) && (
                    <>
                      <div className="font-medium">Death</div>
                      <div>
                        {person.deathDate
                          ? formatPersonDate(person.deathDate)
                          : "-"}
                      </div>
                      <div>
                        {person.deathPlaceHandle
                          ? getPlaceName(
                              "short",
                              person.deathPlaceHandle,
                              placeOptions.places
                            )
                          : "-"}
                      </div>
                    </>
                  )}
                </div>
              )}
            </fieldset>

            <fieldset className="mt-4 rounded border border-gray-300 p-4">
              <legend className="px-2 font-semibold text-gray-700">
                Notes
              </legend>

              {loadingNotes ? (
                <div className="text-sm text-gray-500">
                  Loading notes...
                </div>
              ) : notes.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No Notes found
                </div>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto pr-2 text-sm text-gray-700">
                  {notes.map((note, index) => (
                    <div
                      key={note.handle}
                      className="flex flex-row gap-2 rounded border border-gray-200 bg-gray-50 p-1"
                    >
                      <div className="whitespace-pre-wrap">
                        {index + 1}
                      </div>
                      <div className="whitespace-pre-wrap">
                        {note.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </fieldset>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="grid grid-cols-[1fr_auto] items-end gap-4">
              <div className="space-y-1 text-xs text-gray-500">
                <div>Handle: {person.handle}</div>

                {person.grampsId && (
                  <div>Gramps ID: {person.grampsId}</div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded border px-4 py-2 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <PersonEditModal
        open={editModalOpen}
        person={editItem}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </>
  );
};

export default PersonDetailsModal;