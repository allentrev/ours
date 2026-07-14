// components/Family/ActorNode.tsx

import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import type {
  ActorFlowNode,
  ActorNodeData,
} from "../../types/familyTypes";

const hiddenHandleClass =
  "!h-1 !w-1 !border-0 !bg-transparent opacity-0";

const getNodeClassName = (
  data: ActorNodeData
) => {
  const baseClass =
    "nodrag nopan flex min-h-12 min-w-36 max-w-52 " +
    "items-center justify-center rounded-lg border px-4 py-2 " +
    "text-center text-sm shadow-sm transition-colors";

  switch (data.kind) {
    case "selected":
      return `${baseClass} border-gray-600 bg-gray-100 font-semibold text-gray-900 hover:bg-gray-200`;

    case "add":
      return `${baseClass} border-blue-400 bg-blue-100 font-medium text-blue-800 hover:bg-blue-200`;

    case "family":
      return `${baseClass} border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100`;

    case "person":
    default:
      return `${baseClass} border-gray-300 bg-white text-gray-800 hover:bg-gray-100`;
  }
};

const ActorNode = ({
  data,
}: NodeProps<ActorFlowNode>) => {
  const handleClick = () => {
    if (
      data.kind === "add" &&
      data.eventType
    ) {
      data.onAddActor(
        data.eventType,
        data.selectedPersonHandle
      );

      return;
    }

    if (data.personHandle) {
      data.onOpenPersonDetails(data.personHandle);
    }
  };

  return (
    <>
      {/* Target handles */}
      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        className={hiddenHandleClass}
      />

      <Handle
        id="target-right"
        type="target"
        position={Position.Right}
        className={hiddenHandleClass}
      />

      <Handle
        id="target-bottom"
        type="target"
        position={Position.Bottom}
        className={hiddenHandleClass}
      />

      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        className={hiddenHandleClass}
      />

      <button
        type="button"
        onClick={handleClick}
        className={`${getNodeClassName(data)} whitespace-pre-line`}
      >
        {data.label}
      </button>

      {/* Source handles */}
      <Handle
        id="source-top"
        type="source"
        position={Position.Top}
        className={hiddenHandleClass}
      />

      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        className={hiddenHandleClass}
      />

      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        className={hiddenHandleClass}
      />

      <Handle
        id="source-left"
        type="source"
        position={Position.Left}
        className={hiddenHandleClass}
      />
    </>
  );
};

export default ActorNode;