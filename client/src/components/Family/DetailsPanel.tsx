import type { TreePerson } from "../../types/familyTypes";
import { formatPersonDate } from "../../utilities/Family/formatters";

interface Props {
  person: TreePerson | null;
}

const FamilyDetailsPanel = ({ person }: Props) => {
  const modName = "/components/Family/DetailsPanel";
  const isLiving = !person?.deathDate;
  console.log(`${modName} person`, person);
  if (!person) {
    return (
      <aside className="h-full w-full bg-white p-4 text-sm text-gray-500">
        Select a person to view details.
      </aside>
    );
  }

  return (
    <aside className="h-full w-full flex flex-col bg-blue-100 p-4 overflow-hidden">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {person.displayName}
        </h2>
        <div className="mt-4 flex justify-left">
          {person.primaryPhotoUrl ? (
            <img
              src={person.primaryPhotoUrl}
              alt={person.displayName}
              className="h-48 w-48 rounded-lg border border-gray-300 object-cover shadow"
            />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-500">
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

        </div>
      </div>

      <div className="mt-auto -mx-4 px-4 pt-2 border-t-2 border-gray-300 text-xs text-gray-500">
        <div>Handle: {person.handle}</div>

        {person.grampsId && (
          <div>Gramps ID: {person.grampsId}</div>
        )}
      </div>
    </aside>
  );
};

export default FamilyDetailsPanel;