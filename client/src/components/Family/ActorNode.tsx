// components/Family/ActorNode.tsx

import {
  useEffect,
  useRef,
  type MouseEvent,
} from "react";

import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import type {
  ActorFlowNode,
  ActorNodeData,
} from "../../types/familyTypes";

const CLICK_DELAY = 220;

const hiddenHandleClass =
  "!h-1 !w-1 !border-0 !bg-transparent opacity-0 pointer-events-none";

const getNodeClassName = (
  data: ActorNodeData
) => {
  const baseClass =
    "nodrag nopan nowheel pointer-events-auto " +
    "flex min-h-12 min-w-36 max-w-52 cursor-pointer " +
    "items-center justify-center rounded-lg border px-4 py-2 " +
    "text-center text-sm shadow-sm transition-colors";

  switch (data.kind) {
    case "selected":
      return (
        `${baseClass} border-gray-600 bg-gray-100 ` +
        "font-semibold text-gray-900 hover:bg-gray-200"
      );

    case "add":
      return (
        `${baseClass} border-blue-400 bg-blue-100 ` +
        "font-medium text-blue-800 hover:bg-blue-200"
      );

    case "family":
      return (
        `${baseClass} border-amber-400 bg-amber-50 ` +
        "text-amber-900 hover:bg-amber-100"
      );

    case "person":
    default:
      return (
        `${baseClass} border-gray-300 bg-white ` +
        "text-gray-800 hover:bg-gray-100"
      );
  }
};

const ActorNode = ({
  data,
}: NodeProps<ActorFlowNode>) => {
  const clickTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const clearClickTimer = () => {
    if (!clickTimerRef.current) {
      return;
    }

    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = null;
  };

  const handleSingleClick = () => {
    /*
     * Add nodes retain their existing
     * single-click behaviour.
     */
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

    /*
     * Family nodes do not currently represent
     * a selectable person.
     */
    if (
      data.kind !== "selected" &&
      data.kind !== "person"
    ) {
      return;
    }

    if (!data.personHandle) {
      return;
    }

    data.onSelectPerson(
      data.personHandle
    );
  };

  const handleClick = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    /*
     * Add nodes should respond immediately.
     * They do not need double-click behaviour.
     */
    if (data.kind === "add") {
      handleSingleClick();
      return;
    }

    clearClickTimer();

    clickTimerRef.current = setTimeout(() => {
      handleSingleClick();
      clickTimerRef.current = null;
    }, CLICK_DELAY);
  };

  const handleDoubleClick = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    clearClickTimer();

    if (
      data.kind !== "selected" &&
      data.kind !== "person"
    ) {
      return;
    }

    if (!data.personHandle) {
      return;
    }

    data.onOpenPersonDetails(
      data.personHandle
    );
  };

  return (
    <>
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
        title={
          data.kind === "selected" ||
          data.kind === "person"
            ? "Click to select. Double-click for details."
            : undefined
        }
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={
          `${getNodeClassName(data)} ` +
          "whitespace-pre-line"
        }
      >
        {data.label}
      </button>

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