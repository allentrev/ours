import { useState } from "react";

import type { TreePerson } from "../../types/familyTypes";
import { formatPersonDate } from "../../utilities/Family/formatters";

import PersonDetailsModal from "./PersonDetailsModal";
import PersonRelationshipModal from "./PersonRelationshipModal";

interface Props {
  person: TreePerson | null;
}

const DetailsPanel = ({ person }: Props) => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [relationshipsModalOpen, setRelationshipsModalOpen] = useState(false);
  const isLiving = !person?.deathDate;

  if (!person) {
    return (
      <aside className="h-full w-full bg-white p-4 text-sm text-gray-500">
        Select a person to view details.
      </aside>
    );
  }

  return (
    <>
      <aside className="h-full w-full flex flex-col bg-blue-100 p-4 overflow-hidden">
        <div>
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
              <span className="font-medium">Gender:</span>{" "}
              {person.gender || "Unknown"}
            </div>

            <div>
              <span className="font-medium">Born:</span>{" "}
              {formatPersonDate(person.birthDate, isLiving)}
            </div>

            {person.deathDate && (
              <div>
                <span className="font-medium">Died:</span>{" "}
                {formatPersonDate(person.deathDate)}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(true)}
                className="mt-4 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                More
              </button>
              <button
                type="button"
                onClick={() => setRelationshipsModalOpen(true)}
                className="mt-4 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                Relationships
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto -mx-4 px-4 pt-2 border-t-2 border-gray-300 text-xs text-gray-500">
          <div>Handle: {person.handle}</div>

          {person.grampsId && (
            <div>Gramps ID: {person.grampsId}</div>
          )}
        </div>
      </aside>

      <PersonDetailsModal
        open={detailsModalOpen}
        person={person}
        onClose={() => setDetailsModalOpen(false)}
      />
      <PersonRelationshipModal 
        open={relationshipsModalOpen}
        person={person}
        onClose={() => setRelationshipsModalOpen(false)}
      />
    </>
  );
};

export default DetailsPanel;