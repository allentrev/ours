// components/Family/FamilyEditModal.tsx

import {
  useEffect,
  useState,
} from "react";

import FamilyEditFormArea from "./FamilyEditFormArea";

import type {
  FamilyRecord,
  FamilyDetailsData,
} from "../../types/familyTypes";

interface FamilyEditModalProps {
  open: boolean;
  initialFamily: FamilyDetailsData | null;
  onClose: () => void;
  onSave: ( family: FamilyRecord ) => Promise<void>;
}

const FamilyEditModal = ({
  open,
  initialFamily,
  onClose,
  onSave,
}: FamilyEditModalProps) => {
  const [draft, setDraft] =
    useState<FamilyRecord | null>(
      null
    );
  const [
    relationshipDateModalOpen,
    setRelationshipDateModalOpen,
  ] = useState(false);
  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open || !initialFamily) {
      setDraft(null);
      setSaveError(null);
      return;
    }

    setDraft({
      handle: initialFamily.handle,
      grampsId: initialFamily.grampsId,

      fatherHandle:
        initialFamily.father?.handle,

      motherHandle:
        initialFamily.mother?.handle,

      childHandles:
        initialFamily.children.map(
          (child) => child.handle
        ),

      relationshipType:
        initialFamily.relationshipType,

      relationshipDate:
        initialFamily.relationshipDate,

      relationshipPlaceHandle:
        initialFamily.relationshipPlaceHandle,

      noteHandles:
        initialFamily.notes.map(
          (note) => note.handle
        ),

      mediaHandles: [],

      origin: "local",
    } as FamilyRecord);

    setSaveError(null);
  }, [open, initialFamily]);

  if (!open || !draft) {
    return null;
  }

  const handleSave = async () => {
    if (!draft || saving) {
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      await onSave(draft);
    } catch (error) {
      console.error(
        "Failed to save family:",
        error
      );

      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save family."
      );
    } finally {
      setSaving(false);
    }
  };

  const familySurname = initialFamily
    ? initialFamily.father?.displayName
        ?.split(" ")
        .at(-1) ??
      initialFamily.mother?.displayName
        ?.split(" ")
        .at(-1) ??
      "Unnamed"
    : "Unnamed";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="shrink-0 border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit The {familySurname} Family
          </h2>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <FamilyEditFormArea
            item={draft}
            setItem={setDraft}
            isNew={false}
          />
        </div>
        {saveError && (
        <div className="shrink-0 border-t bg-red-50 px-6 py-3 text-sm text-red-700">
          {saveError}
        </div>
        )}
        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2 border-t bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              rounded bg-blue-600
              px-4 py-2
              text-sm text-white
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyEditModal;