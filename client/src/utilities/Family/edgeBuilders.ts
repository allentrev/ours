import type { Edge, Node } from "@xyflow/react";

import type {
    TreeMode,
    TreeResponse,
    TreeResponseFamily,
    TreeResponseNode,
} from "../../types/familyTypes";
  
export const buildTreeEdges = (
    data: TreeResponse,
    mode: TreeMode,
    visibleFamilies: TreeResponseFamily[],
    selectedFamilies: TreeResponseFamily[],
    selectedPersonHandle: string,
    selectedPersonHiddenSpouseIds: string[],
    useExpandedLayout: boolean,
    multiPartnerBaseNodes: Node[]
): Edge[] => {
    //console.log("buildTreeedges");
    //console.log([...hiddenSpouseNodes]);

    //console.log("Edge: Hidden spouse handles:", [...hiddenSpouseHandles]);
    //console.log("Edge: Hidden IDs:", [...selectedPersonHiddenSpouseIds]);

    const visiblePersonIds = new Set(
      data.nodes
        .filter(
          (node) =>
            mode === "ancestors" || !selectedPersonHiddenSpouseIds.includes(node.id)
        )
        .map((node) => node.id)
    );

   // const multiplePartnerBaseNodes = [...hiddenSpouseNodes];
    //console.log("Multiple partner base nodes for edges:", multiplePartnerBaseNodes);
    //
    // --------------------------- Family Edges -----------------------------------------  
    const familyEdges: Edge[] = visibleFamilies.flatMap((family) => {
      const parentHandles = [
        family.fatherHandle,
        family.motherHandle,
      ].filter(Boolean) as string[];
      //console.log("Processing family for edges:", family);
      
      if (
        mode === "descendants" && !useExpandedLayout &&
        parentHandles.some((handle) => selectedPersonHiddenSpouseIds.includes(handle))
      ) {
        //console.log("Exit here");
        return [];
      }
      //
      //---------------------------- Special Expanded layout section
      if (
        useExpandedLayout &&
        selectedFamilies.includes(family)
      ) {
        const selectedDisplayId = `${selectedPersonHandle}::${family.id}`;
        //console.log("Building edges for expanded layout, family:", family, selectedDisplayId);
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
              style: { strokeWidth: 2 },
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
            sourceHandle: "spouse-right-source",
            targetHandle: "top-target",
            pathOptions: { borderRadius: 30 },
            style: { strokeWidth: 2 },
          }));
        return [...spouseEdges, ...childEdges];
      }
      //
      //---------------------------- Single Parents
      if (parentHandles.length === 1) {
        const parentHandle = parentHandles[0];

        return family.childHandles
          .filter((childHandle) => visiblePersonIds.has(childHandle))
          .map((childHandle) => ({
            id: `edge-${parentHandle}-${childHandle}`,
            source: parentHandle,
            target: childHandle,
            type: "smoothstep",
            sourceHandle: "bottom-source",
            targetHandle: "top-target",
            pathOptions: { borderRadius: 30 },
            style: { strokeWidth: 2 },
          }));
      }
      //
      //---------------------------- Normal section
      const relationshipNodeId = `relationship-${family.id}`;

      const spouseEdges: Edge[] = [
        {
          id: `edge-${family.fatherHandle}-${relationshipNodeId}`,
          source: family.fatherHandle!,
          target: relationshipNodeId,
          type: "straight",
          sourceHandle: "spouse-right-source",
          targetHandle: "left",
          style: { strokeWidth: 2 },
        },
        {
          id: `edge-${family.motherHandle}-${relationshipNodeId}`,
          source: family.motherHandle!,
          target: relationshipNodeId,
          type: "straight",
          sourceHandle: "spouse-left-source",
          targetHandle: "right-target",
          style: { strokeWidth: 2 },
        },
      ]

      const childEdges: Edge[] = family.childHandles
        .filter((childHandle) => visiblePersonIds.has(childHandle))
        .map((childHandle) => ({
          id: `edge-${relationshipNodeId}-${childHandle}`,
          source: relationshipNodeId,
          target: childHandle,
          type: "smoothstep",
          sourceHandle: "bottom",
          targetHandle: "top-target",
          pathOptions: { borderRadius: 30 },
          style: { strokeWidth: 2 },
        }));

      return [...spouseEdges, ...childEdges];
    });

    //
    // --------------------------- Multi Partner Edges -----------------------------------------
    //console.log("Multi partner edges", multiPartnerBaseNodeHandles);
    //console.log("Multi partner nodes", [...multiPartnerBaseNodes]);
    const multiplePartnerEdges: Edge[] = multiPartnerBaseNodes.flatMap(
      (node) => {
        //console.log("Node in flatmaap", node, mode);
        const relationshipNodeId = `relationship-${node.id}`;
        const markerNodeId = node.id;
        const spouseNodeId= node.id.slice(17);

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
                style: { strokeWidth: 2 },
              },
            ]
            :/* deScendants */ [
              {
                id: `edge-${node.id}-${relationshipNodeId}`,
                source: node.id,
                target: relationshipNodeId,
                type: "straight",
                sourceHandle: "spouse-left-source",
                targetHandle: "left",
                style: { strokeWidth: 2 },
              },
              {
                id: `edge-${relationshipNodeId}-${markerNodeId}`,
                source: relationshipNodeId,
                target: spouseNodeId,
                type: "straight",
                sourceHandle: "left-source",
                targetHandle: "spouse-right-target",
                style: { strokeWidth: 2 },
              },
            ];
        //console.log("Direct edges", [...directEdges])
        //console.log("Related families", [...relatedFamilies]);
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
                targetHandle:
                  mode === "ancestors"
                    ? "right"
                    : "top-target",
                pathOptions: { borderRadius: 30 },
                style: { strokeWidth: 2 },
              };
            })
        );
        //console.log("directEdges", directEdges);
        //console.log("childEdges", childEdges);
        return [...directEdges, ...childEdges];
      })
    //console.log("familyEdges:", familyEdges);
    //console.log("multiplePartnerEdges:", multiplePartnerEdges);
    return [...familyEdges, ...multiplePartnerEdges];
  }
