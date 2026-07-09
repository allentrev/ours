import { useEffect, useState } from "react";
import type { NewNoteInput, PersonRecord } from "../../types/familyTypes";

import PersonEditFormArea from "./PersonEditFormArea";

interface PersonEditModalProps {
  open: boolean;
  person: PersonRecord | null;
  onClose: () => void;
  onSave: (
    person: PersonRecord,
    draftNotes: NewNoteInput[]
  ) => Promise<PersonRecord>;
}

const PersonEditModal = ({
  open,
  person,
  onClose,
  onSave,
}: PersonEditModalProps) => {
  const [editItem, setEditItem] =
    useState<PersonRecord | null>(person);

  const [draftNotes, setDraftNotes] =
    useState<NewNoteInput[]>([]);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!open || !person) return;

    setEditItem(person);
    setDraftNotes([]);
    setStatus(null);
  }, [open]);

  if (!open || !editItem) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setStatus(null);

      const savedPerson = await onSave(editItem, draftNotes);

      setEditItem(savedPerson);
      setDraftNotes([]);

      setStatus({
        type: "success",
        message: "Person updated successfully.",
      });
    } catch (error) {
      console.error("Failed to save person", error);

      setStatus({
        type: "error",
        message: "Failed to update person.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStatus(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-[900px] max-w-[95vw] overflow-auto rounded-lg bg-white p-6 shadow-lg">
        {status && (
          <div
            className={`mb-3 rounded border px-3 py-2 text-sm ${
              status.type === "success"
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-red-300 bg-red-50 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <PersonEditFormArea
          person={editItem}
          onChange={(updatedPerson) =>
            setEditItem(updatedPerson as PersonRecord)
          }
          isNew={false}
          draftNotes={draftNotes}
          onDraftNotesChange={setDraftNotes}
        />

        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonEditModal;