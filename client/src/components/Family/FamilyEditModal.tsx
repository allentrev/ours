// components/Family/FamilyEditModal.tsx

import {
  useEffect,
  useState,
} from "react";

import FamilyEditFormArea from "./FamilyEditFormArea";
import {
  validateFamilyDraft,
} from "../../utilities/Family/validators";

import type {
  FamilyRecord,
  FamilyDetailsData,
  NewNoteInput,
  PersonActor,
} from "../../types/familyTypes";

type FamilyEditMode =
  | "create"
  | "edit";

interface FamilyEditModalProps {
  open: boolean;
  mode: FamilyEditMode;
  createdChild: PersonActor | null;
  
  initialFamily:
    | FamilyDetailsData
    | null;
  initialRecord:
    | FamilyRecord
    | null;

  initialCreateChildren?: PersonActor[];

  onClose: () => void;
  onCreateChild: () => void;
  onCreatedChildConsumed: () => void;
  onSave: (
    family: FamilyRecord,
    draftNotes: NewNoteInput[],
    mode: FamilyEditMode,
  ) => Promise<void>;
}

const FamilyEditModal = ({
  open,
  mode,
  createdChild,
  initialFamily,
  initialRecord,
  initialCreateChildren = [],
  onClose,
  onCreatedChildConsumed,
  onCreateChild,
  onSave,
}: FamilyEditModalProps) => {
  const [draft, setDraft] =
    useState<FamilyRecord | null>(
      null
    );

  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState<string | null>(null);

  const [
    draftNotes,
    setDraftNotes,
  ] = useState<NewNoteInput[]>([]);

  const [
    childActors,
    setChildActors,
  ] = useState<PersonActor[]>([]);

  useEffect(() => {
    if (!open) {
      setDraft(null);
      setDraftNotes([]);
      setSaveError(null);
      setSaving(false);

      return;
    }

    if (
      mode === "edit" &&
      initialFamily
    ) {
      setDraft({
        handle:
          initialFamily.handle,

        grampsId:
          initialFamily.grampsId,

        fatherHandle:
          initialFamily.father
            ?.handle,

        motherHandle:
          initialFamily.mother
            ?.handle,

        childHandles:
          initialFamily.children.map(
            (child) =>
              child.handle
          ),

        relationshipType:
          initialFamily
            .relationshipType,

        relationshipDate:
          initialFamily
            .relationshipDate,

        relationshipPlaceHandle:
          initialFamily
            .relationshipPlaceHandle,

        noteHandles:
          initialFamily.notes.map(
            (note) =>
              note.handle
          ),

        mediaHandles: [],

        origin: "local",
      } as FamilyRecord);
      setChildActors([
        ...initialFamily.children,
      ]);
    } else if (
      mode === "create" &&
      initialRecord
    ) {
      setDraft({
        ...initialRecord,

        childHandles: [
          ...(initialRecord
            .childHandles ?? []),
        ],

        noteHandles: [
          ...(initialRecord
            .noteHandles ?? []),
        ],
      });
      setChildActors([
        ...initialCreateChildren,
      ]);
    } else {
      setDraft(null);
      setChildActors([]);
    }

    setDraftNotes([]);
    setSaveError(null);
    setSaving(false);
  }, [
    open,
    mode,
    initialFamily,
    initialRecord,
    initialCreateChildren,
  ]);

  useEffect(() => {
    if (!createdChild || !open) {
      return;
    }

    setDraft((current) => {
      if (
        !current ||
        current.childHandles?.includes(
          createdChild.handle
        )
      ) {
        return current;
      }

      return {
        ...current,
        childHandles: [
          ...(current.childHandles ?? []),
          createdChild.handle,
        ],
      };
    });

    setChildActors((current) => {
      if (
        current.some(
          (child) =>
            child.handle ===
            createdChild.handle
        )
      ) {
        return current;
      }

      return [
        ...current,
        createdChild,
      ];
    });

    onCreatedChildConsumed();
  }, [
    createdChild,
    open,
    onCreatedChildConsumed,
  ]);

  const handleSave = async () => {
    if (!draft || saving) {
      return;
    }

    const validationError =
      validateFamilyDraft(draft);

    if (validationError) {
      setSaveError(validationError);
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      await onSave(draft, draftNotes, mode);
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

  const familySurname =
    initialFamily?.father
      ?.displayName
      ?.split(" ")
      .at(-1) ??
    initialFamily?.mother
      ?.displayName
      ?.split(" ")
      .at(-1) ??
    "";

  const modalTitle =
    mode === "create"
      ? "Create Family"
      : `Edit The ${
          familySurname ||
          "Unnamed"
        } Family`;

  if (!open || !draft) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="shrink-0 border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {modalTitle}
          </h2>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <FamilyEditFormArea
            item={draft}
            setItem={setDraft}
            isNew={mode === "create"}
            
            childActors={childActors}
            onChildActorsChange={
              setChildActors
            }

            existingNotes={
              initialFamily?.notes ?? []
            }
            draftNotes={draftNotes}
            
            fatherName={
              initialFamily?.father
                ?.displayName
            }
            motherName={
              initialFamily?.mother
                ?.displayName
            }
            onCreateChild={onCreateChild}
            onDraftNotesChange={
              setDraftNotes
            }
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