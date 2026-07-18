// components/Family/DetailsPanel.tsx

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

import type {
  ActorEventType,
  PersonAddType,
  TreePerson,
} from "../../types/familyTypes";

import {
  formatPersonDate,
} from "../../utilities/Family/formatters";

import {
  createRelatedPerson,
} from "../../utilities/Family/utils";

import PersonDetailsModal from "./PersonDetailsModal";
import PersonRelationshipsModal from "./PersonRelationshipsModal";
import PersonAddModal from "./PersonAddModal";

interface Props {
  person: TreePerson | null;
  onSelectPerson: (
    personHandle: string
  ) => void;
}
//const modName = "/components/Family/DetailsPanel";

const DetailsPanel = ({
  person,
  onSelectPerson,
}: Props) => {
  //const { user } = useUser();
  //const isAdmin = isAdminUser(user);
  const { getToken } = useAuth();
  const [detailsModalOpen, setDetailsModalOpen,] = useState(false);
  const [relationshipsModalOpen, setRelationshipsModalOpen, ] = useState(false);
  const [pendingDetailsHandle, setPendingDetailsHandle,] = useState<string | null>(null);
  const [
    personAddType,
    setPersonAddType,
  ] = useState<PersonAddType | null>(null);
  const [
    personAddSourceHandle,
    setPersonAddSourceHandle,
  ] = useState<string | null>(null);
  const [
    relationshipsRefreshKey,
    setRelationshipsRefreshKey,
  ] = useState(0);

  const isLiving = !person?.deathDate;

  const handleOpenPersonDetails = (
    personHandle: string
  ) => {
    /*
    * The requested person is already displayed
    * in the DetailsPanel.
    */
    if (personHandle === person?.handle) {
      setRelationshipsModalOpen(false);
      setDetailsModalOpen(true);

      return;
    }

    /*
    * Select the requested person in the main tree.
    * The effect below opens the details modal once
    * the new person reaches this component.
    */
    setPendingDetailsHandle(personHandle);
    setRelationshipsModalOpen(false);
    onSelectPerson(personHandle);
  };

  const handleSelectPerson = (
    personHandle: string
  ) => {
    setRelationshipsModalOpen(false);
    onSelectPerson(personHandle);
  };

  const handleAddActor = (
    eventType: ActorEventType,
    personHandle: string
  ) => {
    console.log("handleAddActor", {
      eventType,
      personHandle,
    });

    if (eventType === "addFamily") {
      console.log(
        "Add Family is not wired yet."
      );

      return;
    }

    setPersonAddType(eventType);
    setPersonAddSourceHandle(personHandle);
  };

  useEffect(() => {
    if (!pendingDetailsHandle) {
      return;
    }

    if (
      person?.handle !== pendingDetailsHandle
    ) {
      return;
    }

    setDetailsModalOpen(true);
    setPendingDetailsHandle(null);
  }, [
    person?.handle,
    pendingDetailsHandle,
  ]);

  if (!person) {
    return (
      <aside className="h-full w-full bg-white p-4 text-sm text-gray-500">
        Select a person to view details.
      </aside>
    );
  }

  return (
    <>
      <aside className="flex h-full w-full flex-col overflow-hidden bg-blue-100 p-4">
        {/* Scrollable details section */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800">
            {person.displayName}
          </h2>

          <div className="mt-4 flex justify-center">
            {person.primaryPhotoUrl ? (
              <img
                src={person.primaryPhotoUrl}
                alt={person.displayName}
                className="h-40 w-40 rounded-lg border border-gray-300 object-cover shadow"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-500">
                No Photo Available
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <div>
              <span className="font-medium">
                Gender:
              </span>{" "}
              {person.gender || "Unknown"}
            </div>

            <div>
              <span className="font-medium">
                Born:
              </span>{" "}
              {formatPersonDate(
                person.birthDate,
                isLiving
              )}
            </div>

            {person.deathDate && (
              <div>
                <span className="font-medium">
                  Died:
                </span>{" "}
                {formatPersonDate(
                  person.deathDate
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setDetailsModalOpen(true)
                }
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                More
              </button>

              <button
                type="button"
                onClick={() =>
                  setRelationshipsModalOpen(
                    true
                  )
                }
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                Relationships
              </button>
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="-mx-4 mt-2 shrink-0 border-t-2 border-gray-300 px-4 pt-2 text-xs text-gray-500">
          <div>
            Handle: {person.handle}
          </div>

          {person.grampsId && (
            <div>
              Gramps ID: {person.grampsId}
            </div>
          )}
        </div>
      </aside>

      <PersonDetailsModal
        open={detailsModalOpen}
        person={person}
        onClose={() =>
          setDetailsModalOpen(false)
        }
      />

      <PersonRelationshipsModal
        open={relationshipsModalOpen}
        person={person}
        refreshKey={relationshipsRefreshKey}
        onClose={() =>
          setRelationshipsModalOpen(false)
        }
        onOpenPersonDetails={
          handleOpenPersonDetails
        }
        onSelectPerson={
          handleSelectPerson
        }
        onAddActor={
          handleAddActor
        }
      />
      <PersonAddModal
        open={personAddType !== null}
        addType={personAddType}
        sourcePerson={person}
        onClose={() => {
          setPersonAddType(null);
          setPersonAddSourceHandle(null);
        }}
        onSave={async (
          personDraft,
          familyHandle
        ) => {
          if (
            !personAddType ||
            !personAddSourceHandle
          ) {
            throw new Error(
              "Relationship information is missing."
            );
          }

          const token = await getToken(
               {skipCache: true,}
          );
          //console.log(`${modName}<PersonAddModal>, ${token}`)
          if (!token) {
            throw new Error(
              "Authentication token is unavailable."
            );
          }

          await createRelatedPerson(
            {
              sourcePersonHandle:
                personAddSourceHandle,

              relationshipType:
                personAddType,

              familyHandle,

              person: personDraft,
            },
            token,
          );

          setPersonAddType(null);
          setPersonAddSourceHandle(null);

          setRelationshipsRefreshKey(
            (current) => current + 1
          );
        }}
      />
    </>
  );
};

export default DetailsPanel;
