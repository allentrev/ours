import type { FamilyPerson } from "../../types/familyTypes";
import { formatFamilyDate } from "../../utilities/familyFormatters";

interface Props {
  person: FamilyPerson | null;
}

const FamilyDetailsPanel = ({ person }: Props) => {
  if (!person) {
    return (
      <aside className="w-72 border-l border-gray-200 bg-white p-4 text-sm text-gray-500">
        Select a person to view details.
      </aside>
    );
  }

  return (
    <aside className="w-72 border-l border-gray-200 bg-white p-4">
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
          {formatFamilyDate(person.birthDate)}
        </div>

        <div>
          <span className="font-medium">Died:</span>{" "}
          {person.deathDate || "—"}
        </div>

        <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div>Handle: {person.handle}</div>
          {person.grampsId && <div>Gramps ID: {person.grampsId}</div>}
        </div>
      </div>
    </aside>
  );
};

export default FamilyDetailsPanel;