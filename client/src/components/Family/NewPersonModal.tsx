// components/Family/NewPersonModal.tsx

import {
  useEffect,
  useState,
} from "react";

import PersonEditFormArea from "./PersonEditFormArea";

import type {
  NewNoteInput,
  PersonRecord,
} from "../../types/familyTypes";

interface NewPersonModalProps {
  open: boolean;
  onClose: () => void;

  onSave: (
    person: Partial<PersonRecord>,
    draftNotes: NewNoteInput[]
  ) => Promise<void>;
}

const emptyPerson: Partial<PersonRecord> = {
  firstName: "",
  surname: "",
  displayName: "",
  gender: "Unknown",
  noteHandles: [],
};

const NewPersonModal = ({
  open,
  onClose,
  onSave,
}: NewPersonModalProps) => {
  const [
    draft,
    setDraft,
  ] = useState<Partial<PersonRecord>>(
    emptyPerson
  );

  const [
    draftNotes,
    setDraftNotes,
  ] = useState<NewNoteInput[]>([]);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft({
      ...emptyPerson,
      noteHandles: [],
    });

    setDraftNotes([]);
    setSaving(false);
    setError(null);
  }, [open]);

  const handleSave = async () => {
    console.log("handleSave", draft, draftNotes);
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onSave(
        draft,
        draftNotes
      );
    } catch (saveError) {
      console.error(
        "Failed to create person:",
        saveError
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to create person."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="shrink-0 border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Create Child
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <PersonEditFormArea
            person={draft}
            isNew
            draftNotes={draftNotes}
            onChange={setDraft}
            onDraftNotesChange={
              setDraftNotes
            }
          />
        </div>

        {error && (
          <div className="shrink-0 border-t bg-red-50 px-6 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex shrink-0 justify-end gap-2 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Create Child"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPersonModal;