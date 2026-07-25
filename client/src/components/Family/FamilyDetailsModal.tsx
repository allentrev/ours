// components/Family/FamilyDetailsModal.tsx

import {
  useEffect,
  useState,
  type MouseEvent,
} from "react";

import type {
  FamilyDetailsData,
} from "../../types/familyTypes";

import {
  readFamily,
} from "../../utilities/Family/utils";

interface FamilyDetailsModalProps {
  open: boolean;
  familyHandle: string | null;
  onClose: () => void;
  onEdit: (
    family: FamilyDetailsData
  ) => void;
}

const FamilyDetailsModal = ({
  open,
  familyHandle,
  onClose,
  onEdit,
}: FamilyDetailsModalProps) => {
  const [
    family,
    setFamily,
  ] = useState<FamilyDetailsData | null>(
    null
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open || !familyHandle) {
      setFamily(null);
      setLoading(false);
      setError(null);

      return;
    }

    let cancelled = false;

    const loadFamily = async () => {
      try {
        setLoading(true);
        setError(null);
        setFamily(null);

        const result =
          await readFamily(
            familyHandle
          );

        if (!cancelled) {
          setFamily(result);
        }
      } catch (loadError) {
        console.error(
          "Failed to load family:",
          loadError
        );

        if (!cancelled) {
          setError(
            "Failed to load family details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadFamily();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    familyHandle,
  ]);

  const familySurname =
    family?.father?.displayName
      ?.split(" ")
      .at(-1) ??
    family?.mother?.displayName
      ?.split(" ")
      .at(-1) ??
    "Unnamed";

  const familyName =
    `The ${familySurname} Family`;

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  };

  if (!open || !familyHandle) {
    return null;
  }

  return (
  <div
    className="
      fixed inset-0 z-[60]
      flex items-center justify-center
      bg-black/40 p-4
    "
    onMouseDown={handleBackdropClick}
  >
    <div
      className="
        flex max-h-[90vh]
        w-full max-w-2xl
        flex-col overflow-hidden
        rounded-lg bg-white
        shadow-xl
      "
    >
      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <div className="py-8 text-center text-sm text-gray-500">
            Loading family details...
          </div>
        )}

        {error && !loading && (
          <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          family && (
            <div className="space-y-6">
              {/* Family heading */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    The {familyName}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onEdit(family)
                  }
                  className="
                    shrink-0 rounded
                    bg-blue-600
                    px-4 py-2
                    text-sm text-white
                    hover:bg-blue-700
                  "
                >
                  Edit
                </button>
              </div>

              {/* Parents */}
              <fieldset className="rounded border border-gray-300 p-4">
                <legend className="px-2 font-semibold text-gray-700">
                  Parents
                </legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Father
                    </div>

                    <div className="mt-1 text-gray-800">
                      {family.father
                        ?.displayName ||
                        "Not recorded"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Mother
                    </div>

                    <div className="mt-1 text-gray-800">
                      {family.mother
                        ?.displayName ||
                        "Not recorded"}
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Relationship */}
              <fieldset className="rounded border border-gray-300 p-4">
                <legend className="px-2 font-semibold text-gray-700">
                  Relationship
                </legend>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Type:
                    </span>{" "}
                    {family.relationshipType ||
                      "Not recorded"}
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">
                      Date:
                    </span>{" "}
                    {family.relationshipDate ||
                      "Not recorded"}
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">
                      Place:
                    </span>{" "}
                    {family.relationshipPlaceName ||
                      "Not recorded"}
                  </div>
                </div>
              </fieldset>

              {/* Children */}
              <fieldset className="rounded border border-gray-300 p-4">
                <legend className="px-2 font-semibold text-gray-700">
                  Children
                </legend>

                {family.children?.length > 0 ? (
                  <ul className="space-y-2">
                    {family.children?.map(
                      (child) => (
                        <li
                          key={child.handle}
                          className="
                            rounded border
                            border-gray-200
                            bg-gray-50
                            px-3 py-2
                            text-sm text-gray-800
                          "
                        >
                          {child.displayName}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No children recorded.
                  </p>
                )}
              </fieldset>

              {/* Notes */}
              <fieldset className="rounded border border-gray-300 p-4">
                <legend className="px-2 font-semibold text-gray-700">
                  Notes
                </legend>

                {family.notes?.length > 0 ? (
                  <div className="space-y-3">
                    {family.notes?.map(
                      (note) => (
                        <div
                          key={note.handle}
                          className="
                            whitespace-pre-wrap
                            rounded border
                            border-gray-200
                            bg-gray-50
                            px-3 py-2
                            text-sm text-gray-700
                          "
                        >
                          {note.text}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No notes recorded.
                  </p>
                )}
              </fieldset>
            </div>
          )}
      </div>

      {/* Fixed footer */}
      <div
        className="
          shrink-0 border-t-2
          border-gray-300
          bg-white px-6 py-3
        "
      >
        <div className="grid grid-cols-[1fr_auto] items-end gap-4">
          <div className="text-xs text-gray-500">
            <div>
              Handle: {familyHandle}
            </div>

            {family?.grampsId && (
              <div>
                Gramps ID:{" "}
                {family.grampsId}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded border
              border-gray-300
              px-4 py-2
              text-sm text-gray-700
              hover:bg-gray-100
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)};

export default FamilyDetailsModal;