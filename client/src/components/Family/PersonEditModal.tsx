import type { PersonRecord } from "../../types/familyTypes";

import FamilyPersonEditFormArea from "./PersonEditFormArea";

interface FamilyPersonEditModalProps {
  open: boolean;
  item: PersonRecord | null;
  setItem: (item: PersonRecord) => void;
  onClose: () => void;
  onSave: () => void;
}

const FamilyPersonEditModal = ({
  open,
  item,
  setItem,
  onClose,
  onSave,
}: FamilyPersonEditModalProps) => {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-[900px] max-w-[95vw] overflow-auto rounded-lg bg-white p-6 shadow-lg">
        <FamilyPersonEditFormArea
          item={item}
          setItem={setItem}
          isNew={false}
        />

        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyPersonEditModal;