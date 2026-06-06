import type { Edge, Node } from "@xyflow/react";

import type {
  FamilyTreeMode,
  FamilyTreeResponse,
} from "../types/familyTypes";

import * as TREE from "../constants/familyTree.constants"

const getHiddenMultiPartnerSpouseHandles = (
  data: FamilyTreeResponse,
  selectedPersonHandle: string,
  mode: FamilyTreeMode,
  useExpandedSelectedPartnerLayout: boolean
) => {
  const hiddenSpouseHandles = new Set<string>();

  //if (mode !== "descendants" || useExpandedSelectedPartnerLayout) {
  if ( useExpandedSelectedPartnerLayout ) {
    return hiddenSpouseHandles;
  }

  data.families?.forEach((family) => {
    const parentHandles = [
      family.fatherHandle,
      family.motherHandle,
    ].filter(Boolean) as string[];

    parentHandles.forEach((parentHandle) => {
      if (parentHandle === selectedPersonHandle) return;

      const parentNode = data.nodes.find(
        (node) => node.id === parentHandle
      );

      if (!parentNode || (parentNode.noPartners ?? 0) <= 2) {
        return;
      }

      parentHandles.forEach((otherHandle) => {
        if (otherHandle !== parentHandle) {
          hiddenSpouseHandles.add(otherHandle);
        }
      });
    });
  });

  return hiddenSpouseHandles;
};

export const buildFamilyTreeNodes = (
  data: FamilyTreeResponse,
  selectedPersonHandle: string,
  mode: FamilyTreeMode
): Node[] => {
  console.log("Set up variables for layout...");
  const selectedTreeNode = data.nodes.find(
    (node) => node.id === selectedPersonHandle
  );

  const selectedNoPartners = selectedTreeNode?.noPartners ?? 0;

  const useExpandedSelectedPartnerLayout =
    mode === "descendants" && selectedNoPartners > 2;

  const hiddenSpouseHandles = getHiddenMultiPartnerSpouseHandles(
    data,
    selectedPersonHandle,
    mode,
    useExpandedSelectedPartnerLayout
  );
  console.log("Hidden spouse handles:", [...hiddenSpouseHandles]);
  // --------------------------------------------------
  // Base depth layout
  //  For each depth level, calc total width of that level based on number of nodes,
  //  then position each node with equal horizontal gaps, centered around x=0. 
  //  Y co-ordinate is based on depth and mode (ancestors above, descendants below)
  // --------------------------------------------------
//// need to process data nodes and remove any multi-partner spouses that should be hidden before this step
  const nodesByDepth = data.nodes.reduce<Record<number, typeof data.nodes>>(
    (acc, node) => {
      if (!acc[node.depth]) {
        acc[node.depth] = [];
      }

      acc[node.depth].push(node);

      return acc;
    },
    {}
  );
  console.log("NodesByDepth:", nodesByDepth);

  const personNodes: Node[] = data.nodes.map((node) => {
    const generation = nodesByDepth[node.depth];

    const indexInGeneration = generation.findIndex(
      (item) => item.id === node.id
    );

    const generationWidth =
      generation.length * TREE.NODE_WIDTH;

    return {
      id: node.id,
      type: "person",
      position: {
        x:
          indexInGeneration * TREE.NODE_WIDTH -
          generationWidth / 2,
        y:
          mode === "ancestors"
            ? -node.depth * TREE.LEVEL_HEIGHT
            : node.depth * TREE.LEVEL_HEIGHT,
      },
      data: {
        label: node.label,
        gender: node.gender,
        birthDate: node.birthDate,
        deathDate: node.deathDate,
        isSelected: node.id === selectedPersonHandle,
        personHandle: node.id,
        noPartners: node.noPartners ?? 0,
      },
    };
  });
  console.log("Initial person nodes:", personNodes);

  const visiblePersonIds = new Set(
    personNodes.map((node) => node.id)
  );
  console.log("Visible person IDs:", [...visiblePersonIds]);

  const visibleFamilies =
    data.families?.filter((family) => {
      if (!family.fatherHandle && !family.motherHandle) {
        return false;
      }

      const parentHandles = [
        family.fatherHandle,
        family.motherHandle,
      ].filter(Boolean) as string[];

      return parentHandles.some((parentHandle) =>
        visiblePersonIds.has(parentHandle)
      );
    }) ?? [];
  
    const selectedFamilies = visibleFamilies.filter(
    (family) =>
      family.fatherHandle === selectedPersonHandle ||
      family.motherHandle === selectedPersonHandle
  );
  console.log("Visible families:", visibleFamilies);
  console.log("Selected person's families:", selectedFamilies);

  // --------------------------------------------------
  // Selected person with exactly 2 partners
  // --------------------------------------------------
  if (
    mode === "descendants" &&
    selectedFamilies.length === 2
  ) {
    console.log("Selected person with 2 partners")
    const selectedNode = personNodes.find(
      (node) => node.id === selectedPersonHandle
    );

    if (selectedNode) {
      selectedNode.position.x = 0;

      selectedFamilies.forEach((family, index) => {
        const spouseHandle =
          family.fatherHandle === selectedPersonHandle
            ? family.motherHandle
            : family.fatherHandle;

        const spouseNode = personNodes.find(
          (node) => node.id === spouseHandle
        );

        if (!spouseNode) return;

        spouseNode.position.y = selectedNode.position.y;

        spouseNode.position.x =
          index === 0
            ? -TREE.NODE_WIDTH
            : TREE.NODE_WIDTH;
      });
    }
  }

  // --------------------------------------------------
  // Selected person with >2 partners
  // Note: the expanded layout is only shown for descendants,
  // so we don't have to worry about it affecting ancestor layout.
  // --------------------------------------------------
  if (useExpandedSelectedPartnerLayout) {
    console.log("Selected person with > 2 partners");

    const selectedNode = personNodes.find(
      (node) => node.id === selectedPersonHandle
    );

    if (selectedNode) {
      const baseY = selectedNode.position.y;

      const filteredPersonNodes = personNodes.filter(
        (node) => node.id !== selectedPersonHandle
      );

      const repeatedSelectedNodes: Node[] =
        selectedFamilies.map((family, index) => ({
          ...selectedNode,
          id: `${selectedPersonHandle}::${family.id}`,
          type: "person",
          position: {
            x: 0,
            y: baseY + index * TREE.PARTNERSHIP_ROW_SPACING,
          },
          data: {
            ...selectedNode.data,
            isSelected: true,
            personHandle: selectedPersonHandle,
            familyId: family.id,
          },
        }));

      personNodes.length = 0;

      personNodes.push(
        ...filteredPersonNodes,
        ...repeatedSelectedNodes
      );

      // ----------------------------------------------
      // Position selected spouses only
      // ----------------------------------------------
      selectedFamilies.forEach((family) => {
        const spouseHandle =
          family.fatherHandle === selectedPersonHandle
            ? family.motherHandle
            : family.fatherHandle;

        const repeatedSelectedNode = personNodes.find(
          (node) =>
            node.id ===
            `${selectedPersonHandle}::${family.id}`
        );

        if (!repeatedSelectedNode) return;

        if (spouseHandle) {
          const spouseNode = personNodes.find(
            (node) => node.id === spouseHandle
          );

          if (spouseNode) {
            spouseNode.position.x =
              TREE.NODE_WIDTH;

            spouseNode.position.y =
              repeatedSelectedNode.position.y;
          }
        }
      });

      // ----------------------------------------------
      // Push lower descendants downward
      // ----------------------------------------------
      const expandedSectionHeight =
        selectedFamilies.length *
          TREE.PARTNERSHIP_ROW_SPACING +
        TREE.CHILD_SECTION_GAP;

      personNodes.forEach((node) => {
        const personHandle =
          node.data.personHandle as
            | string
            | undefined;

        if (!personHandle) return;

        if (
          personHandle === selectedPersonHandle
        ) {
          return;
        }

        const isSelectedPartner =
          selectedFamilies.some(
            (family) =>
              family.fatherHandle ===
                personHandle ||
              family.motherHandle ===
                personHandle
          );

        if (isSelectedPartner) {
          return;
        }

        node.position.y += expandedSectionHeight;
      });
    }
  }

  // --------------------------------------------------
  // Hide spouses replaced by MultiplePartnerNode
  // --------------------------------------------------
  const visiblePersonNodes = personNodes.filter(
    (node) =>
      !hiddenSpouseHandles.has(node.id)
  );
  console.log("Visible Person Nodes:", visiblePersonNodes);
  // --------------------------------------------------
  // AT THIS POINT WE HAVE visiblePersonNodes containing all nodes in the tree to be displayed
  // in their right positions
  // --------------------------------------------------

  const getDisplayNodeId = (
    personHandle: string,
    familyId: string
  ) => {
    console.log("getDisplayNodeId for selected person:", selectedPersonHandle, familyId);
    if (
      useExpandedSelectedPartnerLayout &&
      personHandle ===
        selectedPersonHandle
    ) {
      return `${personHandle}::${familyId}`;
    }

    return personHandle;
  };
  // --------------------------------------------------
  // Add Standard relationship nodes
  // --------------------------------------------------
  const relationshipNodes: Node[] =
    visibleFamilies.flatMap((family) => {
      console.log("Processing family for relationship node:", family);
      if (
        useExpandedSelectedPartnerLayout &&
        selectedFamilies.includes(family)
      ) {
        return [];
      }

      if (
        !family.fatherHandle ||
        !family.motherHandle
      ) {
        return [];
      }

      if (
        hiddenSpouseHandles.has(
          family.fatherHandle
        ) ||
        hiddenSpouseHandles.has(
          family.motherHandle
        )
      ) {
        return [];
      }

      const fatherNode =
        visiblePersonNodes.find(
          (node) =>
            node.id ===
            getDisplayNodeId(
              family.fatherHandle!,
              family.id
            )
        );

      const motherNode =
        visiblePersonNodes.find(
          (node) =>
            node.id ===
            getDisplayNodeId(
              family.motherHandle!,
              family.id
            )
        );

      if (!fatherNode || !motherNode) {
        return [];
      }

      return [
        {
          id: `relationship-${family.id}`,
          type: "relationship",
          position: {
            x:
              (fatherNode.position.x +
                TREE.PERSON_CARD_WIDTH / 2 +
                motherNode.position.x +
                TREE.PERSON_CARD_WIDTH / 2) /
                2 -
              TREE.RELATIONSHIP_NODE_SIZE / 2,
            y:
              fatherNode.position.y +
              TREE.PERSON_CARD_HEIGHT / 2 -
              TREE.RELATIONSHIP_NODE_SIZE / 2,
          },
          data: {},
        },
      ];
    });

  // --------------------------------------------------
  // Multiple partner summary nodes
  // --------------------------------------------------
    //mode === "descendants" &&
    const multiplePartnerBaseNodes =
      mode === "descendants" &&
      !useExpandedSelectedPartnerLayout
      ? visiblePersonNodes.filter((node) => {
        console.log("Checking multiple partner base nodes:", node.id);
        const noPartners = Number(
            node.data.noPartners ?? 0
          );

          return (
            node.id !==
              selectedPersonHandle &&
            noPartners > 2
          );
        })
      : [];

  const multiplePartnerRelationshipNodes: Node[] =
    multiplePartnerBaseNodes.map(
      (node) => ({
        id: `relationship-multiple-partner-${node.id}`,
        type: "relationship",
        position: {
          x:
            node.position.x +
            TREE.PERSON_CARD_WIDTH +
            40,
          y:
            node.position.y +
            TREE.PERSON_CARD_HEIGHT / 2 -
            TREE.RELATIONSHIP_NODE_SIZE / 2,
        },
        data: {},
      })
    );
  console.log("Multiple partner relationship nodes:", multiplePartnerRelationshipNodes);
  
  const multiplePartnerNodes: Node[] =
    multiplePartnerBaseNodes.map(
      (node) => ({
        id: `multiple-partner-${node.id}`,
        type: "multiplePartner",
        position: {
          x:
            node.position.x +
            TREE.NODE_WIDTH,
          y: node.position.y,
        },
        data: {
          personHandle: node.id,
          noPartners:
            node.data.noPartners,
          label: node.data.label,
        },
      })
    );

  console.log("Multiple partner nodes:", multiplePartnerNodes);

  return [
    ...visiblePersonNodes,
    ...relationshipNodes,
    ...multiplePartnerRelationshipNodes,
    ...multiplePartnerNodes,
  ];
};

export const buildFamilyTreeEdges = (
  data: FamilyTreeResponse,
  selectedPersonHandle: string,
  mode: FamilyTreeMode
): Edge[] => {
  const selectedTreeNode = data.nodes.find(
    (node) => node.id === selectedPersonHandle
  );

  const selectedNoPartners = selectedTreeNode?.noPartners ?? 0;

  const useExpandedSelectedPartnerLayout =
    mode === "descendants" && selectedNoPartners > 2;

  const hiddenSpouseHandles = getHiddenMultiPartnerSpouseHandles(
    data,
    selectedPersonHandle,
    mode,
    useExpandedSelectedPartnerLayout
  );

  const visiblePersonIds = new Set(
    data.nodes
      .filter((node) => !hiddenSpouseHandles.has(node.id))
      .map((node) => node.id)
  );

  const visibleFamilies =
    data.families?.filter((family) => {
      if (!family.fatherHandle && !family.motherHandle) {
        return false;
      }

      const parentHandles = [
        family.fatherHandle,
        family.motherHandle,
      ].filter(Boolean) as string[];

      return parentHandles.some((parentHandle) =>
        visiblePersonIds.has(parentHandle)
      );
    }) ?? [];

  const selectedFamilies = visibleFamilies.filter(
    (family) =>
      family.fatherHandle === selectedPersonHandle ||
      family.motherHandle === selectedPersonHandle
  );

  const familyEdges: Edge[] =
    visibleFamilies.flatMap((family) => {
      const parentHandles = [
        family.fatherHandle,
        family.motherHandle,
      ].filter(Boolean) as string[];

      if (
        parentHandles.some((handle) =>
          hiddenSpouseHandles.has(handle)
        )
      ) {
        return [];
      }

      // ----------------------------------------------
      // Expanded selected-person multi-partner mode
      // ----------------------------------------------
      if (
        useExpandedSelectedPartnerLayout &&
        selectedFamilies.includes(family)
      ) {
        const selectedDisplayId =
          `${selectedPersonHandle}::${family.id}`;

        const spouseHandle =
          family.fatherHandle ===
          selectedPersonHandle
            ? family.motherHandle
            : family.fatherHandle;

        const spouseEdges: Edge[] =
          spouseHandle
            ? [
                {
                  id:
                    `edge-${selectedDisplayId}` +
                    `-${spouseHandle}`,

                  source: selectedDisplayId,
                  target: spouseHandle,

                  type: "straight",

                  sourceHandle:
                    "spouse-right-source",

                  targetHandle:
                    "spouse-left-target",

                  style: {
                    strokeWidth: 2,
                  },
                },
              ]
            : [];

        const childEdges: Edge[] =
          family.childHandles
            .filter((childHandle) =>
              visiblePersonIds.has(
                childHandle
              )
            )
            .map((childHandle) => ({
              id:
                `edge-${selectedDisplayId}` +
                `-${childHandle}-${family.id}`,
              source: selectedDisplayId,
              target: childHandle,
              type: "smoothstep",
              sourceHandle:
                "spouse-left-source",
              targetHandle:
                "top-target",
              pathOptions: {
                borderRadius: 30,
              },
              style: {
                strokeWidth: 2,
              },
            }));
        return [
          ...spouseEdges,
          ...childEdges,
        ];
      }

      // ----------------------------------------------
      // Single parent family
      // ----------------------------------------------
      if (parentHandles.length === 1) {
        const parentHandle =
          parentHandles[0];

        return family.childHandles
          .filter((childHandle) =>
            visiblePersonIds.has(
              childHandle
            )
          )
          .map((childHandle) => ({
            id:
              `edge-${parentHandle}` +
              `-${childHandle}`,

            source: parentHandle,
            target: childHandle,

            type: "smoothstep",

            sourceHandle:
              "bottom-source",

            targetHandle:
              "top-target",

            pathOptions: {
              borderRadius: 30,
            },

            style: {
              strokeWidth: 2,
            },
          }));
      }

      // ----------------------------------------------
      // Standard relationship node family
      // ----------------------------------------------
      const relationshipNodeId =
        `relationship-${family.id}`;

      const spouseEdges: Edge[] = [
        {
          id:
            `edge-${family.fatherHandle}` +
            `-${relationshipNodeId}`,

          source:
            family.fatherHandle!,

          target:
            relationshipNodeId,

          type: "straight",

          sourceHandle:
            "spouse-right-source",

          targetHandle: "left",

          style: {
            strokeWidth: 2,
          },
        },

        {
          id:
            `edge-${family.motherHandle}` +
            `-${relationshipNodeId}`,

          source:
            family.motherHandle!,

          target:
            relationshipNodeId,

          type: "straight",

          sourceHandle:
            "spouse-left-source",

          targetHandle:
            "right-target",

          style: {
            strokeWidth: 2,
          },
        },
      ];

      const childEdges: Edge[] =
        family.childHandles
          .filter((childHandle) =>
            visiblePersonIds.has(
              childHandle
            )
          )
          .map((childHandle) => ({
            id:
              `edge-${relationshipNodeId}` +
              `-${childHandle}`,

            source:
              relationshipNodeId,

            target: childHandle,

            type: "smoothstep",

            sourceHandle: "bottom",

            targetHandle:
              "top-target",

            pathOptions: {
              borderRadius: 30,
            },

            style: {
              strokeWidth: 2,
            },
          }));

      return [
        ...spouseEdges,
        ...childEdges,
      ];
    });

  // --------------------------------------------------
  // Multiple partner summary edges
  // --------------------------------------------------
  const multiplePartnerBaseNodes =
    mode === "descendants" &&
    !useExpandedSelectedPartnerLayout
      ? data.nodes.filter(
          (node) =>
            !hiddenSpouseHandles.has(
              node.id
            ) &&
            node.id !==
              selectedPersonHandle &&
            (node.noPartners ?? 0) > 2
        )
      : [];

  const multiplePartnerEdges: Edge[] =
    multiplePartnerBaseNodes.flatMap(
      (node) => {
        const relationshipNodeId =
          `relationship-multiple-partner-${node.id}`;

        const markerNodeId =
          `multiple-partner-${node.id}`;

        const relatedFamilies =
          data.families?.filter(
            (family) =>
              family.fatherHandle ===
                node.id ||
              family.motherHandle ===
                node.id
          ) ?? [];

        const directEdges: Edge[] = [
          {
            id:
              `edge-${node.id}` +
              `-${relationshipNodeId}`,

            source: node.id,

            target:
              relationshipNodeId,

            type: "straight",

            sourceHandle:
              "spouse-right-source",

            targetHandle: "left",

            style: {
              strokeWidth: 2,
            },
          },

          {
            id:
              `edge-${relationshipNodeId}` +
              `-${markerNodeId}`,

            source:
              relationshipNodeId,

            target: markerNodeId,

            type: "straight",

            sourceHandle:
              "right-source",

            targetHandle: "left",

            style: {
              strokeWidth: 2,
            },
          },
        ];

        const childEdges: Edge[] =
          relatedFamilies.flatMap(
            (family) =>
              family.childHandles
                .filter(
                  (childHandle) =>
                    visiblePersonIds.has(
                      childHandle
                    )
                )
                .map((childHandle) => ({
                  id:
                    `edge-${relationshipNodeId}` +
                    `-${childHandle}`,

                  source:
                    relationshipNodeId,

                  target:
                    childHandle,

                  type: "smoothstep",

                  sourceHandle:
                    "bottom",

                  targetHandle:
                    "top-target",

                  pathOptions: {
                    borderRadius: 30,
                  },

                  style: {
                    strokeWidth: 2,
                  },
                }))
          );

        return [
          ...directEdges,
          ...childEdges,
        ];
      }
    );

  return [
    ...familyEdges,
    ...multiplePartnerEdges,
  ];
};