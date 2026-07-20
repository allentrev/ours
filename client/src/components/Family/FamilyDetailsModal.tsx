// components/Family/FamilyDetailsModal.tsx

interface FamilyDetailsModalProps {
  open: boolean;
  familyHandle: string | null;
  onClose: () => void;
}

const FamilyDetailsModal = ({
  open,
  familyHandle,
  onClose,
}: FamilyDetailsModalProps) => {
  if (!open || !familyHandle) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Family Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {familyHandle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        {/* Temporary content */}
        <div className="px-6 py-6 text-sm text-gray-600">
          Family details will be displayed here.
        </div>
      </div>
    </div>
  );
};

export default FamilyDetailsModal;