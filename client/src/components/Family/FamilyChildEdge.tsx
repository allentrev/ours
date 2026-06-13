import {
  BaseEdge,
  type EdgeProps,
} from "@xyflow/react";

type FamilyChildEdgeData = {
  channelOffset?: number;
};

const DEFAULT_CHANNEL_OFFSET = 80;

const FamilyChildEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  data,
}: EdgeProps) => {
  const edgeData = data as FamilyChildEdgeData | undefined;

  const channelOffset =
    typeof edgeData?.channelOffset === "number"
      ? edgeData.channelOffset
      : DEFAULT_CHANNEL_OFFSET;

  const SOURCE_CLEARANCE = 40;
  const TARGET_CLEARANCE = 40;

  const minChannelY = sourceY + SOURCE_CLEARANCE;
  const maxChannelY = targetY - TARGET_CLEARANCE;

  const requestedChannelY = targetY - channelOffset;

  const channelY = Math.min(
    Math.max(requestedChannelY, minChannelY),
    maxChannelY
  );

  const edgePath = `
    M ${sourceX},${sourceY}
    L ${sourceX},${channelY}
    L ${targetX},${channelY}
    L ${targetX},${targetY}
  `;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  );
};

export default FamilyChildEdge;