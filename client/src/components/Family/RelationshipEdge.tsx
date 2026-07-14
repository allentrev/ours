import {
  BaseEdge,
  Position,
  type EdgeProps,
} from "@xyflow/react";

interface RelationshipEdgeData extends Record<string, unknown> {
  mergeY?: number;
}

const MERGE_DISTANCE = 70;

const RelationshipEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  markerStart,
  markerEnd,
  style,
  interactionWidth,
  data,
}: EdgeProps) => {
  const edgeData =
    data as RelationshipEdgeData | undefined;

  let path: string;

  switch (sourcePosition) {
    case Position.Left: {
      const mergeX =
        sourceX - MERGE_DISTANCE;

      const mergeY =
        edgeData?.mergeY ?? sourceY;

      path = [
        `M ${sourceX} ${sourceY}`,
        `L ${mergeX} ${sourceY}`,
        `L ${mergeX} ${mergeY}`,
        `L ${mergeX} ${targetY}`,
        `L ${targetX} ${targetY}`,
      ].join(" ");

      break;
    }

    case Position.Right: {
      const mergeX =
        sourceX + MERGE_DISTANCE;

      const mergeY =
        edgeData?.mergeY ?? sourceY;

      path = [
        `M ${sourceX} ${sourceY}`,
        `L ${mergeX} ${sourceY}`,
        `L ${mergeX} ${mergeY}`,
        `L ${mergeX} ${targetY}`,
        `L ${targetX} ${targetY}`,
      ].join(" ");

      break;
    }

    case Position.Top: {
      const mergeY =
        sourceY - MERGE_DISTANCE;

      path = [
        `M ${sourceX} ${sourceY}`,
        `L ${sourceX} ${mergeY}`,
        `L ${targetX} ${mergeY}`,
        `L ${targetX} ${targetY}`,
      ].join(" ");

      break;
    }

    case Position.Bottom:
    default: {
      const mergeY =
        sourceY + MERGE_DISTANCE;

      path = [
        `M ${sourceX} ${sourceY}`,
        `L ${sourceX} ${mergeY}`,
        `L ${targetX} ${mergeY}`,
        `L ${targetX} ${targetY}`,
      ].join(" ");

      break;
    }
  }

  return (
    <BaseEdge
      id={id}
      path={path}
      markerStart={markerStart}
      markerEnd={markerEnd}
      interactionWidth={interactionWidth}
      style={{
        ...style,
        strokeLinejoin: "miter",
        strokeLinecap: "butt",
      }}
    />
  );
};

export default RelationshipEdge;