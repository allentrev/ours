import { Handle, Position} from "@xyflow/react";
import { useUser } from "@clerk/clerk-react";

import { isAdminUser } from "@/utilities/authRoles";

import {
  formatPersonDate,
  calculateAge,
  isPersonProbablyLiving,
} from "../../utilities/Family/formatters";

import {
  PERSON_NODE_HEIGHT_ADJUSTMENT,
  SLOT_HEIGHT,
} from "../../constants/familyTree.constants";

import type { GenealogicalDate } from "@/types/familyTypes";

interface PersonNodeData {
  label: string;
  shortId: string;
  gender?: string;
  birthDate?: GenealogicalDate;
  deathDate?: GenealogicalDate;
  isSelected?: boolean;
}
interface Props {
  data: PersonNodeData;
}

const PersonNode = ({ data }: Props) => {
  
  const { user } = useUser(); 
  const isAdmin = isAdminUser(user);
  
  const isLiving = isPersonProbablyLiving(
    data.birthDate,
    data.deathDate
  );
  const age = calculateAge(isLiving,data.birthDate?.text, data.deathDate?.text);

  return (
    <div
      className={`relative min-w-[180px] rounded-xl border bg-white shadow-md ${
        data.isSelected
          ? "border-blue-600 ring-4 ring-blue-200"
          : "border-gray-300"
      }`}
      style={{
        height: SLOT_HEIGHT - PERSON_NODE_HEIGHT_ADJUSTMENT,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
      />

      <Handle
        type="source"
        position={Position.Left}
        id="spouse-left-source"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="spouse-left-target"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="spouse-right-source"
      />

      <Handle
        type="target"
        position={Position.Right}
        id="spouse-right-target"
      />

      {/*
      * Keep the card contents clipped to the
      * rounded corners without clipping the
      * React Flow handles.
      */}
      <div className="overflow-hidden rounded-xl h-full">
        <div className="bg-blue-600 px-3 py-2">
          <h3 className="text-sm font-semibold text-white truncate">
            {data.label || "Unknown"}
          </h3>

          {isAdmin && (
            <div className="text-xs text-blue-100">
              {data.shortId}
            </div>
          )}
        </div>

        <div className="p-3 text-sm text-gray-700 space-y-1">
          <div>
            <span className="font-medium">
              Born:
            </span>{" "}
            {formatPersonDate(
              data.birthDate,
              isLiving
            )}
          </div>

          <div>
            <span className="font-medium">
              Died:
            </span>{" "}
            {formatPersonDate(
              data.deathDate,
              isLiving
            )}
          </div>

          <div>
            <span className="font-medium">
              Age:
            </span>{" "}
            {age}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonNode;