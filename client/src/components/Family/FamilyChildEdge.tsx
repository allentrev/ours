import {
  BaseEdge,
  type EdgeProps,
} from "@xyflow/react";

type FamilyChildEdgeData = {
  /*
   * vertical-channel:
   *   distance above the target used for the
   *   shared horizontal route.
   *
   * horizontal-first:
   *   horizontal distance from the source before
   *   the edge turns downwards.
   */
  channelOffset?: number;

  /*
   * Used by horizontal-first routing.
   *
   * All children in one family receive the same
   * value, giving that family one shared horizontal
   * child channel.
   */
  targetOffset?: number;

  routeMode?:
    | "vertical-channel"
    | "horizontal-first";
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
  interactionWidth,
}: EdgeProps) => {
  const edgeData =
    data as FamilyChildEdgeData | undefined;

  const channelOffset =
    typeof edgeData?.channelOffset === "number"
      ? edgeData.channelOffset
      : DEFAULT_CHANNEL_OFFSET;

  const targetOffset =
    typeof edgeData?.targetOffset === "number"
      ? edgeData.targetOffset
      : 0;

  const routeMode =
    edgeData?.routeMode ??
    "vertical-channel";

  let edgePath: string;

  if (routeMode === "horizontal-first") {
    const SOURCE_CLEARANCE = 30;
    const TARGET_CLEARANCE = 40;

    /*
     * Travel horizontally away from the spouse
     * before turning downwards.
     */
    const channelX =
      sourceX + channelOffset;

    /*
     * Every child in one family shares this
     * horizontal approach level.
     */
    const requestedApproachY =
      targetY -
      TARGET_CLEARANCE -
      targetOffset;

    /*
     * Keep the shared child channel below the
     * spouse node.
     */
    const approachY =
      Math.max(
        requestedApproachY,
        sourceY + SOURCE_CLEARANCE
      );

    edgePath = `
      M ${sourceX},${sourceY}
      L ${channelX},${sourceY}
      L ${channelX},${approachY}
      L ${targetX},${approachY}
      L ${targetX},${targetY}
    `;
  } else {
    const SOURCE_CLEARANCE = 40;
    const TARGET_CLEARANCE = 40;

    const minChannelY =
      sourceY + SOURCE_CLEARANCE;

    const maxChannelY =
      targetY - TARGET_CLEARANCE;

    const requestedChannelY =
      targetY - channelOffset;

    /*
     * If the source and target generations are
     * too close together, there is no valid channel
     * satisfying both clearances. In that case,
     * use the midpoint between the handles.
     */
    const hasEnoughVerticalSpace =
      minChannelY <= maxChannelY;

    const channelY =
      hasEnoughVerticalSpace
        ? Math.min(
            Math.max(
              requestedChannelY,
              minChannelY
            ),
            maxChannelY
          )
        : sourceY +
          (targetY - sourceY) / 2;

    edgePath = `
      M ${sourceX},${sourceY}
      L ${sourceX},${channelY}
      L ${targetX},${channelY}
      L ${targetX},${targetY}
    `;
  }

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={style}
      interactionWidth={
        interactionWidth ?? 30
      }
    />
  );
};

export default FamilyChildEdge;