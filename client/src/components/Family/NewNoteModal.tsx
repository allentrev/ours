import { useState } from "react";

import type { NoteRecord } from "../../types/familyTypes";
import { createNote } from "../../utilities/Family/utils";

interface NewNoteModalProps {
  open: boolean;
  getToken: () => Promise<string | null>;
  onClose: () => void;
  onSave: (note: NoteRecord) => void;
}

const NewNoteModal = ({
  open,
  getToken,
  onClose,
  onSave,
}: NewNoteModalProps) => {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSave = async () => {
    const trimmedText = text.trim();

    if (!trimmedText) return;

    const token = await getToken();
    console.log("Token in NewNoteModal:", token);

    try {
      setSaving(true);
      setError("");

      const savedNote = await createNote(
        {
          text: trimmedText,
        } as NoteRecord,
        token
      );

      onSave(savedNote);
      setText("");
      onClose();
    } catch (err) {
      console.error("Failed to create note", err);
      setError("Failed to create note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-[500px] max-w-[95vw] rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          New Note
        </h2>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={8}
          className="w-full rounded border border-gray-300 p-2"
          placeholder="Enter note text..."
        />

        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewNoteModal;