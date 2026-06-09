import type { TreePerson } from "../../types/familyTypes";
import { formatPersonDate } from "../../utilities/Family/formatters";

interface Props {
  person: TreePerson | null;
}


const FamilyDetailsPanel = ({ person }: Props) => {
  const isLiving = !person?.deathDate;

  if (!person) {
  
    return (
      <aside className="w-full lg:w-80 border-l border-gray-200 bg-white p-4 text-sm text-gray-500">
        Select a person to view details.
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 bg-blue-100 p-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {person.displayName}
      </h2>

      <div className="mt-4 space-y-3 text-sm text-gray-700">
        <div>
          <span className="font-medium">Gender:</span>{" "}
          {person.gender || "Unknown"}
        </div>

        <div>
          <span className="font-medium">Born:</span>{" "}
          {formatPersonDate(person.birthDate, isLiving)}
        </div>
        {person?.deathDate && (
        <div>
          <span className="font-medium">Died:</span>{" "}
          {formatPersonDate(person.deathDate) || ""}
        </div>
        )}
        <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div>Handle: {person.handle}</div>
          {person.grampsId && <div>Gramps ID: {person.grampsId}</div>}
        </div>
      </div>
    </aside>
  );
};

export default FamilyDetailsPanel;