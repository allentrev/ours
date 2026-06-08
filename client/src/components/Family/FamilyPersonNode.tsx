import { Handle, Position } from "@xyflow/react";

import {
  formatPersonDate,
  calculateAge,
  isPersonProbablyLiving,
} from "../../utilities/familyFormatters";

interface FamilyPersonNodeData {
  label: string;
  shortId: string;
  gender?: string;
  birthDate?: string;
  deathDate?: string;
  isSelected?: boolean;
}

interface Props {
  data: FamilyPersonNodeData;
}

const FamilyPersonNode = ({ data }: Props) => {
  const isLiving = isPersonProbablyLiving(
    data.birthDate,
    data.deathDate
  );
  const age = calculateAge(isLiving,data.birthDate, data.deathDate);

  return (
    <div
      className={`relative min-w-[180px] rounded-xl border bg-white shadow-md overflow-hidden ${
        data.isSelected
          ? "border-blue-600 ring-4 ring-blue-200"
          : "border-gray-300"
      }`}
    >
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />

      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Left} id="spouse-left-source" />
      <Handle type="target" position={Position.Left} id="spouse-left-target" />
      
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Right} id="spouse-right-source" />
      <Handle type="target" position={Position.Right} id="spouse-right-target" />

      <div className="bg-blue-600 px-3 py-2">
        <h3 className="text-sm font-semibold text-white truncate">
          {data.label || "Unknown"}
        </h3>
          <div className="text-xs text-blue-100">
            {data.shortId}
        </div>
      </div>

      <div className="p-3 text-sm text-gray-700 space-y-1">
        <div>
          <span className="font-medium">Born:</span>{" "}
          {formatPersonDate(data.birthDate, isLiving)}
        </div>
      
        <div>
          <span className="font-medium">Died:</span>{" "}
          {data.deathDate || "-"}
        </div>
        
        <div>
          <span className="font-medium">Age:</span>{" "}
          { age }
        </div>

      </div>
    </div>
  );
};

export default FamilyPersonNode;