import type { Edge, Node } from "@xyflow/react";

import type { LayoutContext } from "./layoutTypes";

export const buildTreeEdges = (
  context: LayoutContext,
  multiPartnerBaseNodes: Node[]
): Edge[] => {
  const {
    data,
    mode,
    visibleFamilies,
    selectedFamilies,
    selectedPersonHandle,
    selectedPersonHiddenSpouseIds,
    useExpandedLayout,
  } = context;

  const BORDER_RADIUS= 50;
  
  const FAMILY_CHANNELS = [60, 85, 100, 120, 130];

  const visiblePersonIds = new Set(
    data.nodes
      .filter(
        (node) =>
          mode === "ancestors" ||
          !selectedPersonHiddenSpouseIds.includes(node.id)
      )
      .map((node) => node.id)
  );

  const familyEdges: Edge[] = visibleFamilies.flatMap((family,familyIndex) => {
    const parentHandles = [
      family.fatherHandle,
      family.motherHandle,
    ].filter(Boolean) as string[];

    if (
      mode === "descendants" &&
      !useExpandedLayout &&
      parentHandles.some((handle) =>
        selectedPersonHiddenSpouseIds.includes(handle)
      )
    ) {
      return [];
    }

    if (useExpandedLayout && selectedFamilies.includes(family)) {
      const selectedDisplayId = `${selectedPersonHandle}::${family.id}`;

      const spouseHandle =
        family.fatherHandle === selectedPersonHandle
          ? family.motherHandle
          : family.fatherHandle;

      const spouseEdges: Edge[] = spouseHandle
        ? [
            {
              id: `edge-${selectedDisplayId}-${spouseHandle}`,
              source: `multiple-partner-${selectedDisplayId}`,
              target: spouseHandle,
              type: "straight",
              sourceHandle: "spouse-right-source",
              targetHandle: "spouse-left-target",
              style: { 
                strokeWidth: 2.5,
                stroke: "#374151",
              },
            },
          ]
        : [];

      const childEdges: Edge[] = family.childHandles
        .filter((childHandle) => visiblePersonIds.has(childHandle))
        .map((childHandle) => ({
          id: `edge-${selectedDisplayId}-${childHandle}-${family.id}`,
          source: spouseHandle!,
          target: childHandle,
          type: "smoothstep",
          classname:"child-edge",
          sourceHandle: "spouse-right-source",
          targetHandle: "top-target",
          interactionWidth: 30,
          pathOptions: {
            borderRadius: BORDER_RADIUS,
          },
          style: {
            strokeWidth: 2.5,
            stroke: "#2563eb",
          },
        }));

      return [...spouseEdges, ...childEdges];
    }

    if (parentHandles.length === 1) {
      const parentHandle = parentHandles[0];

      return family.childHandles
        .filter((childHandle) => visiblePersonIds.has(childHandle))
        .map((childHandle) => ({
          id: `edge-${parentHandle}-${childHandle}`,
          source: parentHandle,
          target: childHandle,
          type: "smoothstep",
          classname:"child-edge",
          sourceHandle: "bottom-source",
          targetHandle: "top-target",
          interactionWidth: 30,
          pathOptions: {
            borderRadius: BORDER_RADIUS,
          },
          style: {
            strokeWidth: 2.5,
            stroke: "#2563eb",
          },
        }));
    }

    const relationshipNodeId = `relationship-${family.id}`;

    const spouseEdges: Edge[] = [
      {
        id: `edge-${family.fatherHandle}-${relationshipNodeId}`,
        source: family.fatherHandle!,
        target: relationshipNodeId,
        type: "straight",
        sourceHandle: "spouse-right-source",
        targetHandle: "left",
        style: {
          strokeWidth: 2.5,
          stroke: "#374151",
        },
      },
      {
        id: `edge-${family.motherHandle}-${relationshipNodeId}`,
        source: family.motherHandle!,
        target: relationshipNodeId,
        type: "straight",
        sourceHandle: "spouse-left-source",
        targetHandle: "right-target",
        style: {
          strokeWidth: 2.5,
          stroke: "#374151",
        },
      },
    ];

    const childEdges: Edge[] = family.childHandles
      .filter((childHandle) => visiblePersonIds.has(childHandle))
      .map((childHandle) => ({
        id: `edge-${relationshipNodeId}-${childHandle}`,
        source: relationshipNodeId,
        target: childHandle,
        type: "familyChild",
        classname:"child-edge",
        animated: true,
        sourceHandle: "bottom",
        targetHandle: "top-target",
        interactionWidth: 30,
        data: {
          channelOffset: FAMILY_CHANNELS[familyIndex % FAMILY_CHANNELS.length],
        },
        pathOptions: { 
          borderRadius: BORDER_RADIUS,
        },
        style: {
          strokeWidth: 2.5,
          stroke: "#2563eb",
        },
      }));

    return [...spouseEdges, ...childEdges];
  });

  const multiplePartnerEdges: Edge[] = multiPartnerBaseNodes.flatMap((node) => {
    const relationshipNodeId = `relationship-${node.id}`;
    const markerNodeId = node.id;
    const spouseNodeId = node.id.slice(17);

    const relatedFamilies =
      data.families?.filter(
        (family) =>
          family.fatherHandle === spouseNodeId ||
          family.motherHandle === spouseNodeId
      ) ?? [];

    const directEdges: Edge[] =
      mode === "ancestors"
        ? [
            {
              id: `edge-${markerNodeId}-${spouseNodeId}`,
              source: node.id,
              target: spouseNodeId,
              type: "straight",
              sourceHandle: "spouse-right-source",
              targetHandle: "spouse-left-target",
              style: {
                strokeWidth: 2.5,
                stroke:"#374151",
              },
            },
          ]
        : [
            {
              id: `edge-${node.id}-${relationshipNodeId}`,
              source: node.id,
              target: relationshipNodeId,
              type: "straight",
              sourceHandle: "spouse-left-source",
              targetHandle: "left",
              style: {
                strokeWidth: 2.5,
                stroke: "374151"
              },
            },
            {
              id: `edge-${relationshipNodeId}-${markerNodeId}`,
              source: relationshipNodeId,
              target: spouseNodeId,
              type: "straight",
              sourceHandle: "left-source",
              targetHandle: "spouse-right-target",
              style: {
                strokeWidth: 2.5,
                stroke: "#374151",
              },
            },
          ];

    const childEdges: Edge[] = relatedFamilies.flatMap((family) =>
      family.childHandles
        .filter((childHandle) => visiblePersonIds.has(childHandle))
        .map((childHandle) => {
          const targetNodeId =
            mode === "ancestors"
              ? markerNodeId
              : childHandle;

          return {
            id: `edge-${relationshipNodeId}-${targetNodeId}-${childHandle}`,
            source: relationshipNodeId,
            target: targetNodeId,
            type: "smoothstep",
            sourceHandle: "bottom",
            classname:"child-edge",
            targetHandle:
              mode === "ancestors"
                ? "right"
                : "top-target",
            pathOptions: { borderRadius: BORDER_RADIUS },
            style: {
              strokeWidth: 2.5,
              stroke: "#2563eb",
              strokedDasharray: "6 4",
            },
          };
        })
    );

    return [...directEdges, ...childEdges];
  });

  return [...familyEdges, ...multiplePartnerEdges];
};