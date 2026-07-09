import { useState } from "react";

interface NewNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

const NewNoteModal = ({
  open,
  onClose,
  onSave,
}: NewNoteModalProps) => {
  const [text, setText] = useState("");

  if (!open) return null;

  const handleSave = () => {
    const trimmedText = text.trim();

    if (!trimmedText) return;

    onSave(trimmedText);
    setText("");
    onClose();
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

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewNoteModal;