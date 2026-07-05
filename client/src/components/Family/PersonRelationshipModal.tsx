import type { TreePerson } from "../../types/familyTypes";

interface FamilyPersonRelationshipsModalProps {
  open: boolean;
  person: TreePerson | null;
  onClose: () => void;
}

const FamilyPersonRelationshipsModal = ({
  open,
  person,
  onClose,
}: FamilyPersonRelationshipsModalProps) => {
  if (!open || !person) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[600px] max-w-[95vw] rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Relationships
          </h2>
        </div>

        {/* Body */}
        <div className="min-h-[200px] text-gray-700">
          Relationships for <strong>{person.displayName}</strong> will appear here.
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t pt-4">
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
  );
};

export default FamilyPersonRelationshipsModal;