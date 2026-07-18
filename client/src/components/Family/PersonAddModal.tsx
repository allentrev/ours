// components/Family/PersonAddModal.tsx

import {
  useEffect,
  useState,
} from "react";

import type {
  ActorChildFamily,
  PersonAddType,
  PersonActorData,
  PersonRecord,
  TreePerson,
} from "../../types/familyTypes";

import {
  readPersonRelationships,
} from "../../utilities/Family/utils";

import PersonFormCore from "./PersonFormCore";

interface PersonAddModalProps {
  open: boolean;
  addType: PersonAddType | null;
  sourcePerson: TreePerson | null;

  onClose: () => void;

  onSave: (
    person: Partial<PersonRecord>,
    familyHandle?: string
  ) => void | Promise<void>;
}

const NEW_FAMILY_VALUE =
  "__new_single_parent_family__";

const createBlankPerson =
  (): Partial<PersonRecord> => ({
    gender: "Unknown",
    firstName: "",
    surname: "",
    displayName: "",
    birthDate: "",
    deathDate: "",
    birthPlaceHandle: "",
    deathPlaceHandle: "",
    primaryPhotoUrl: "",
    noteHandles: [],
  });

const getModalTitle = (
  addType: PersonAddType | null
) => {
  switch (addType) {
    case "addChild":
      return "Add Child";

    case "addPartner":
      return "Add Partner";

    case "addSibling":
      return "Add Sibling";

    default:
      return "Add Person";
  }
};

const getRelationshipDescription = (
  addType: PersonAddType,
  sourcePersonName: string
) => {
  switch (addType) {
    case "addChild":
      return `Adding a child of ${sourcePersonName}`;

    case "addPartner":
      return `Adding a partner of ${sourcePersonName}`;

    case "addSibling":
      return `Adding a sibling of ${sourcePersonName}`;
  }
};

const PersonAddModal = ({
  open,
  addType,
  sourcePerson,
  onClose,
  onSave,
}: PersonAddModalProps) => {
  const [
    personDraft,
    setPersonDraft,
  ] = useState<Partial<PersonRecord>>(
    createBlankPerson
  );

  const [
    childFamilies,
    setChildFamilies,
  ] = useState<ActorChildFamily[]>([]);

  const [
    selectedFamilyHandle,
    setSelectedFamilyHandle,
  ] = useState<string | null>(null);

  const [
    loadingFamilies,
    setLoadingFamilies,
  ] = useState(false);

  const [
    familyLoadError,
    setFamilyLoadError,
  ] = useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPersonDraft(
      createBlankPerson()
    );

    setChildFamilies([]);
    setSelectedFamilyHandle(null);
    setLoadingFamilies(false);
    setFamilyLoadError(null);
    setSaving(false);
    setError(null);
  }, [
    open,
    addType,
    sourcePerson?.handle,
  ]);

  useEffect(() => {
    if (
      !open ||
      addType !== "addChild" ||
      !sourcePerson?.handle
    ) {
      return;
    }

    let cancelled = false;

    const loadChildFamilies =
      async () => {
        try {
          setLoadingFamilies(true);
          setFamilyLoadError(null);

          const result:
            PersonActorData =
              await readPersonRelationships(
                sourcePerson.handle
              );

          if (cancelled) {
            return;
          }

          const availableFamilies =
            result.childFamilies ?? [];

          setChildFamilies(
            availableFamilies
          );

          /*
           * With exactly one family, select it
           * automatically.
           *
           * With zero or multiple families, null
           * means create a new single-parent
           * family until the user chooses another
           * option.
           */
          setSelectedFamilyHandle(
            availableFamilies.length === 1
              ? availableFamilies[0].handle
              : null
          );
        } catch (loadError) {
          console.error(
            "Failed to load child family options",
            loadError
          );

          if (!cancelled) {
            setFamilyLoadError(
              "Failed to load existing families."
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingFamilies(false);
          }
        }
      };

    void loadChildFamilies();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    addType,
    sourcePerson?.handle,
  ]);

  if (
    !open ||
    !addType ||
    !sourcePerson
  ) {
    return null;
  }

  const handleSave = async () => {
    const firstName =
      personDraft.firstName?.trim() ??
      "";

    const surname =
      personDraft.surname?.trim() ??
      "";

    if (!firstName && !surname) {
      setError(
        "Enter at least a first name or surname."
      );

      return;
    }

    if (
      addType === "addChild" &&
      loadingFamilies
    ) {
      setError(
        "Wait for the family options to finish loading."
      );

      return;
    }

    if (
      addType === "addChild" &&
      familyLoadError
    ) {
      setError(
        "The available families could not be loaded."
      );

      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onSave(
        {
          ...personDraft,
          firstName,
          surname,

          displayName: [
            firstName,
            surname,
          ]
            .filter(Boolean)
            .join(" "),
        },

        addType === "addChild"
          ? selectedFamilyHandle ??
              undefined
          : undefined
      );
    } catch (saveError) {
      console.error(
        "Failed to add person",
        saveError
      );

      setError(
        "Failed to add person."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[95vh] w-[850px] max-w-[96vw] flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {getModalTitle(addType)}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {getRelationshipDescription(
                addType,
                sourcePerson.displayName
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        </div>

        {/* Form */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {addType === "addChild" && (
              <fieldset className="rounded border border-gray-300 p-4">
                <legend className="px-2 font-semibold text-gray-700">
                  Child&apos;s family
                </legend>

                {loadingFamilies ? (
                  <div className="text-sm text-gray-500">
                    Loading available
                    families...
                  </div>
                ) : familyLoadError ? (
                  <div className="text-sm text-red-600">
                    {familyLoadError}
                  </div>
                ) : childFamilies.length ===
                  0 ? (
                  <div className="text-sm text-gray-600">
                    No existing partner
                    family was found. A new
                    single-parent family will
                    be created.
                  </div>
                ) : childFamilies.length ===
                  1 ? (
                  <div className="text-sm text-gray-700">
                    The child will be added
                    to{" "}
                    <span className="font-medium">
                      {
                        childFamilies[0]
                          .displayName
                      }
                    </span>
                    .
                  </div>
                ) : (
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Select the family:
                    <select
                      value={
                        selectedFamilyHandle ??
                        NEW_FAMILY_VALUE
                      }
                      onChange={(event) => {
                        setSelectedFamilyHandle(
                          event.target.value ===
                            NEW_FAMILY_VALUE
                            ? null
                            : event.target.value
                        );
                      }}
                      className="rounded border border-gray-300 bg-white px-3 py-2"
                    >
                      {childFamilies.map(
                        (family) => (
                          <option
                            key={
                              family.handle
                            }
                            value={
                              family.handle
                            }
                          >
                            {
                              family.displayName
                            }
                          </option>
                        )
                      )}

                      <option
                        value={
                          NEW_FAMILY_VALUE
                        }
                      >
                        Create a new
                        single-parent family
                      </option>
                    </select>
                  </label>
                )}
              </fieldset>
            )}

            <PersonFormCore
              person={personDraft}
              onChange={
                setPersonDraft
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-4">
          {error && (
            <div className="mb-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                void handleSave();
              }}
              disabled={
                saving ||
                loadingFamilies
              }
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {saving
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonAddModal;
