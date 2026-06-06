import type { Edge, Node } from "@xyflow/react";

import type {
  FamilyTreeMode,
  FamilyTreeResponse,
} from "../types/familyTypes";

import * as TREE from "../constants/familyTree.constants";

const isADescendantOf = (potentialDescendantHandle: string, ancestorHandle: string, data: FamilyTreeResponse): boolean => {
  const visited = new Set<string>();
  const toVisit = [potentialDescendantHandle];

  while (toVisit.length > 0) {
    const currentHandle = toVisit.pop()!;
    if (currentHandle === ancestorHandle) {
      return true;
    }
    visited.add(currentHandle);

    const parentFamilies = data.families?.filter((family) =>
      family.childHandles.includes(currentHandle)
    ) ?? [];

    parentFamilies.forEach((family) => {
      const parentHandles = [family.fatherHandle, family.motherHandle].filter(Boolean) as string[];
      parentHandles.forEach((parentHandle) => {
        if (!visited.has(parentHandle)) {
          toVisit.push(parentHandle);
        }
      });
    });
  }

  return false;
}

const getHiddenMultiPartnerSpouseHandles = (
  data: FamilyTreeResponse,
  selectedPersonHandle: string,
  mode: FamilyTreeMode,
  useExpandedSelectedPartnerLayout: boolean
) => {
  const hiddenSpouseHandles = new Set<string>();

  if (useExpandedSelectedPartnerLayout) {
    return hiddenSpouseHandles;
  }

  //-----------------------
  // get array of nodes with >partners
  // for each node with >2 partners, find their families
  //  For each family, find the other spouse handle
  // add it to the list
  data.families?.forEach((family) => {
    const parentHandles = [
      family.fatherHandle,
      family.motherHandle,
    ].filter(Boolean) as string[];

    //console.log("parenthandles", parentHandles);

    parentHandles.forEach((parentHandle) => {
      if (parentHandle === selectedPersonHandle) return ;

      const parentNode = data.nodes.find(
        (node) => node.id === parentHandle
      );

      if (!parentNode || (parentNode.noPartners ?? 0) <= 2) {
        return;
      }

      parentHandles.forEach((otherHandle) => {
        if (otherHandle === parentHandle) return;

        if (mode === "ancestors") {
          //if the selected Person is a descnedant of this handle, then set yes  
          const isADescendant = isADescendantOf(selectedPersonHandle, otherHandle, data);
          if (isADescendant) {
            //console.log("4", otherHandle);
            return;
          }
        }
        //console.log("5", otherHandle);
        hiddenSpouseHandles.add(otherHandle);
      });
    });
  }); 

  return hiddenSpouseHandles;
};
// --------------------------------------------------
// Main function to build nodes for the family tree
// --------------------------------------------------
export const buildFamilyTreeNodes = (
  data: FamilyTreeResponse,
  selectedPersonHandle: string,
  mode: FamilyTreeMode
): Node[] => {
  const selectedTreeNode = data.nodes.find(
    (node) => node.id === selectedPersonHandle
  );
  // console.log("Input data nodes:", data.nodes);
  
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
  
  let workNodes = data.nodes;
  const initialNodes = data.nodes;
  
  let visibleWorkNodes = [] as typeof data.nodes;
  let visibleWorkPersonIds = new Set();

// --------------------------------------------------
// Determine which families are visible based on the visible person nodes
// This is important for determining where to place relationship nodes and how to handle multi-partner logic
// --------------------------------------------------
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
        visibleWorkPersonIds.has(parentHandle)
      );
    }) ?? [];

  const selectedFamilies = visibleFamilies.filter(
    (family) =>
      family.fatherHandle === selectedPersonHandle ||
      family.motherHandle === selectedPersonHandle
  );
  // console.log("Visible families:", visibleFamilies);
  // console.log("Selected families:", selectedFamilies);

  if (mode === "ancestors") {
    const ancestorMap = new Map<string, typeof data.nodes[number]>();

    const addAncestors = (personHandle: string, depth: number) => {
      if (depth > 5) return;

      const family = data.families?.find((family) =>
        family.childHandles.includes(personHandle)
      );

      if (!family) return;

      const parentHandles = [
        family.fatherHandle,
        family.motherHandle,
      ].filter(Boolean) as string[];

      parentHandles.forEach((parentHandle) => {
        const person = data.nodes.find(
          (node) => node.id === parentHandle
        );

        if (!person) return;
        const dummyPerson = {
          id: `dummy-${parentHandle}`,
          label: "Unknown",
          depth,
          noPartners: 0,
        }
        
        if (!ancestorMap.has(person.id)) {
          if (person.noPartners && person.noPartners > 2) {
            console.log("Adding hidden spouses for ancestor:", person.id);
            ancestorMap.set("42", {
              ...dummyPerson,
              depth,
            });
          }
          ancestorMap.set(person.id, {
            ...person,
            depth,
          });

          addAncestors(parentHandle, depth + 1);
        }
      });
    };

    const selectedPerson = data.nodes.find(
      (node) => node.id === selectedPersonHandle
    );

    if (selectedPerson) {
      ancestorMap.set(selectedPerson.id, {
        ...selectedPerson,
        depth: 0,
      });

      addAncestors(selectedPersonHandle, 1);
    }

    workNodes = Array.from(ancestorMap.values());
  }
  // -------------------------------------------------------
// Set up visible work nodes:
//  Descendants = workNodes minus hidden spouses
//  Ancestors = all workNodes
//
// and then set up Nodes by depth for initial layout calculations
// -------------------------------------------------------
  visibleWorkNodes = workNodes.filter((node) => !hiddenSpouseHandles.has(node.id))
    //mode === "descendants"
    //  ? workNodes.filter((node) => !hiddenSpouseHandles.has(node.id))
    //  : workNodes;

  visibleWorkPersonIds = new Set(
    visibleWorkNodes.map((node) => node.id)
  );

  console.log("Visible work nodes:", visibleWorkNodes);
  
  // --------------------------------------------------
  // Any visible person with exactly 2 partners
  //
  // Layout:
  //
  // Spouse1 ─ Person ─ Spouse2
  //
  // Applies in BOTH ancestor and descendant mode
  // --------------------------------------------------

  // GET ARRAY OF PERSONS WITH = 2 PARTNER
  const twoPartnerArray = visibleWorkNodes.filter(
    (node) =>
      node.id !== selectedPersonHandle &&
      Number(node.noPartners ?? 0) === 2
  );
  // console.log("Persons with 2 partners:", twoPartnerArray);
  // for each person with 2 partners, find their families and reposition spouses if both are visible
  twoPartnerArray.forEach((personNode) => {
    const personHandle = personNode.id;

    const personFamilies = visibleFamilies.filter(
      (family) =>
        family.fatherHandle === personHandle ||
        family.motherHandle === personHandle
    );

    if (personFamilies.length !== 2) return;
    //console.log("PersonFamilies2:", personFamilies);

    // Get spouse handles
    const spouseHandles = personFamilies.map((family) =>
      family.fatherHandle === personHandle
        ? family.motherHandle
        : family.fatherHandle
    );
    //console.log("Spouse nodes for person with 2 partners:", spouseHandles);

    // Remove these node fom visibleWorkNodes if they are there, we will add them back after repositioning
    const spouse1= initialNodes.find((node) => node.id === spouseHandles[0]);
    const spouse2= initialNodes.find((node) => node.id === spouseHandles[1]);
    const insertionArray= [spouse1, personNode, spouse2].filter(Boolean) as typeof data.nodes;

    //console.log("Spouse 1 node:", spouse1);
    //console.log("Spouse 2 node:", spouse2);
    const insertionPoint = visibleWorkNodes.findIndex(
      (node) => node.id === personHandle
    );
    //remove spouses
      visibleWorkNodes = visibleWorkNodes.filter(
        (node) =>
          node.id !== spouseHandles[0] && node.id !== spouseHandles[1]
      );
    visibleWorkPersonIds.delete(spouseHandles[0]!);
    visibleWorkPersonIds.delete(spouseHandles[1]!);
    //console.log("Visible work nodes after removing spouses for 2-partner person:", visibleWorkNodes);

    const leftHandArray = visibleWorkNodes.slice(0, insertionPoint-1);
    const rightHandArray = visibleWorkNodes.slice(insertionPoint + 1);
    //console.log("Left hand array:", leftHandArray);
    //console.log("Right hand array:", rightHandArray);

    visibleWorkNodes = [...leftHandArray, ...insertionArray, ...rightHandArray];
      //console.log("Visible work nodes after adding back 2-partner person and spouses:", visibleWorkNodes);

    visibleWorkPersonIds = new Set(
      visibleWorkNodes.map((node) => node.id)
  );

    // ---------------------------------------------------------------------------    
    //console.log("Visible work nodes + 2-partner person:", visibleWorkNodes);
  })

  const nodesByDepth = visibleWorkNodes.reduce<
    Record<number, typeof data.nodes>
  >((acc, node) => {
    if (!acc[node.depth]) {
      acc[node.depth] = [];
    }

    acc[node.depth].push(node);

    return acc;
  }, {});

  const personNodes: Node[] = visibleWorkNodes.map((node) => {
    const generation = nodesByDepth[node.depth];

    const indexInGeneration = generation.findIndex(
      (item) => item.id === node.id
    );

    const generationWidth = generation.length * TREE.NODE_WIDTH;

    return {
      id: node.id,
      type: "person",
      position: {
        x: indexInGeneration * TREE.NODE_WIDTH - generationWidth / 2,
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
        noPartners:
          mode === "ancestors"
            ? Math.max(0,
                        Number(node.noPartners ?? 0) - 1
              )
            : node.noPartners,
      },
    };
  });
  console.log("Nodes  by depth", nodesByDepth);  
  console.log("Person nodes after initial layout:", personNodes);
//console.log("Person nodes after handling 2-partner families:", personNodes);
// --------------------------------------------------
// Special handling for selected person with more than 2 partners in descendant mode:
//
// Instead of trying to fit all partners on the same row, we repeat the selected person for each family
// and create a vertical stack of partnerships:
// 
// Person-Family1-Spouse
// Person-Family2-Spouse
// Person-Family3-Spouse
//
// This allows us to show all partners without needing to increase horizontal spacing, and also creates a clear visual grouping of each partnership and their children.
// --------------------------------------------------
  if (useExpandedSelectedPartnerLayout) {
    const selectedNode = personNodes.find(
      (node) => node.id === selectedPersonHandle
    );

    if (selectedNode) {
      const baseY = selectedNode.position.y;

      const filteredPersonNodes = personNodes.filter(
        (node) => node.id !== selectedPersonHandle
      );

      const repeatedSelectedNodes: Node[] = selectedFamilies.map(
        (family, index) => ({
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
        })
      );

      personNodes.length = 0;
      personNodes.push(...filteredPersonNodes, ...repeatedSelectedNodes);

      selectedFamilies.forEach((family) => {
        const spouseHandle =
          family.fatherHandle === selectedPersonHandle
            ? family.motherHandle
            : family.fatherHandle;

        const repeatedSelectedNode = personNodes.find(
          (node) =>
            node.id === `${selectedPersonHandle}::${family.id}`
        );

        if (!repeatedSelectedNode) return;

        if (spouseHandle) {
          const spouseNode = personNodes.find(
            (node) => node.id === spouseHandle
          );

          if (spouseNode) {
            spouseNode.position.x = TREE.NODE_WIDTH;
            spouseNode.position.y = repeatedSelectedNode.position.y;
          }
        }
      });

      const expandedSectionHeight =
        selectedFamilies.length * TREE.PARTNERSHIP_ROW_SPACING +
        TREE.CHILD_SECTION_GAP;

      personNodes.forEach((node) => {
        const personHandle = node.data.personHandle as string | undefined;

        if (!personHandle) return;
        if (personHandle === selectedPersonHandle) return;

        const isSelectedPartner = selectedFamilies.some(
          (family) =>
            family.fatherHandle === personHandle ||
            family.motherHandle === personHandle
        );

        if (isSelectedPartner) return;

        node.position.y += expandedSectionHeight;
      });
    }
  }
// --------------------------------------------------
// Set up visible Person nodes:
//  Descendants = personNodes minus hidden spouses
//  Ancestors = all personNodes
// --------------------------------------------------
  const visiblePersonNodes =
    mode === "descendants"
      ? personNodes.filter((node) => !hiddenSpouseHandles.has(node.id))
      : personNodes;

  // --------------------------------------------------
  // Helper function for relationship nodes:
  //
  // --------------------------------------------------    
  const getDisplayNodeId = (personHandle: string, familyId: string) => {
    if (
      useExpandedSelectedPartnerLayout &&
      personHandle === selectedPersonHandle
    ) {
      return `${personHandle}::${familyId}`;
    }

    return personHandle;
  };
// --------------------------------------------------
// Now insert relationship nodes for families where both parents are visible and not hidden due to multi-partner logic
// --------------------------------------------------
  const relationshipNodes: Node[] = visibleFamilies.flatMap((family) => {
    if (
      useExpandedSelectedPartnerLayout &&
      selectedFamilies.includes(family)
    ) {
      return [];
    }

    if (!family.fatherHandle || !family.motherHandle) {
      return [];
    }

    if (
      hiddenSpouseHandles.has(family.fatherHandle) ||
      hiddenSpouseHandles.has(family.motherHandle)
    ) {
      return [];
    }

    const fatherNode = visiblePersonNodes.find(
      (node) =>
        node.id === getDisplayNodeId(family.fatherHandle!, family.id)
    );

    const motherNode = visiblePersonNodes.find(
      (node) =>
        node.id === getDisplayNodeId(family.motherHandle!, family.id)
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

  const multiplePartnerBaseNodes = !useExpandedSelectedPartnerLayout
    ? visiblePersonNodes.filter((node) => {
        const noPartners = Number(node.data.noPartners ?? 0);

        return node.id !== selectedPersonHandle && noPartners > 2;
      })
    : [];

  const multiplePartnerNodes: Node[] = multiplePartnerBaseNodes.map(
    (node) => ({
      id: `multiple-partner-${node.id}`,
      type: "multiplePartner",
      position: {
        x:
          mode === "ancestors"
            ? node.position.x - TREE.NODE_WIDTH
            : node.position.x + TREE.NODE_WIDTH,
        y: node.position.y,
      },
      data: {
        personHandle: node.id,
        noPartners: node.data.noPartners,
        label: node.data.label,
      },
    })
  );

  const multiplePartnerRelationshipNodes: Node[] =
    multiplePartnerBaseNodes.map((node) => ({
      id: `relationship-multiple-partner-${node.id}`,
      type: "relationship",
      position: {
        x:
          mode === "ancestors"
            ? node.position.x - 40
            : node.position.x + TREE.PERSON_CARD_WIDTH + 40,
        y:
          node.position.y +
          TREE.PERSON_CARD_HEIGHT / 2 -
          TREE.RELATIONSHIP_NODE_SIZE / 2,
      },
      data: {},
    }));

    // console.log("Final person nodes:", personNodes);
    // console.log("Relationship nodes:", relationshipNodes);
    // console.log("Multiple partner nodes:", multiplePartnerNodes);
    // console.log("Multiple partner relationship nodes:", multiplePartnerRelationshipNodes);
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
      .filter(
        (node) =>
          mode === "ancestors" || !hiddenSpouseHandles.has(node.id)
      )
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

  const familyEdges: Edge[] = visibleFamilies.flatMap((family) => {
    const parentHandles = [
      family.fatherHandle,
      family.motherHandle,
    ].filter(Boolean) as string[];

    if (
      mode === "descendants" &&
      parentHandles.some((handle) => hiddenSpouseHandles.has(handle))
    ) {
      return [];
    }

    if (
      useExpandedSelectedPartnerLayout &&
      selectedFamilies.includes(family)
    ) {
      const selectedDisplayId = `${selectedPersonHandle}::${family.id}`;

      const spouseHandle =
        family.fatherHandle === selectedPersonHandle
          ? family.motherHandle
          : family.fatherHandle;

      const spouseEdges: Edge[] = spouseHandle
        ? [
            {
              id: `edge-${selectedDisplayId}-${spouseHandle}`,
              source: selectedDisplayId,
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
          source: selectedDisplayId,
          target: childHandle,
          type: "smoothstep",
          sourceHandle: "spouse-left-source",
          targetHandle: "top-target",
          pathOptions: { borderRadius: 30 },
          style: { strokeWidth: 2 },
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
          sourceHandle: "bottom-source",
          targetHandle: "top-target",
          pathOptions: { borderRadius: 30 },
          style: { strokeWidth: 2 },
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
    ];

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

  const multiplePartnerBaseNodes = !useExpandedSelectedPartnerLayout
    ? data.nodes.filter(
        (node) =>
          (mode === "ancestors" || !hiddenSpouseHandles.has(node.id)) &&
          node.id !== selectedPersonHandle &&
          (node.noPartners ?? 0) > 2
      )
    : [];

  const multiplePartnerEdges: Edge[] = multiplePartnerBaseNodes.flatMap(
    (node) => {
      const relationshipNodeId = `relationship-multiple-partner-${node.id}`;
      const markerNodeId = `multiple-partner-${node.id}`;

      const relatedFamilies =
        data.families?.filter(
          (family) =>
            family.fatherHandle === node.id ||
            family.motherHandle === node.id
        ) ?? [];

      const directEdges: Edge[] =
        mode === "ancestors"
          ? [
              {
                id: `edge-${markerNodeId}-${relationshipNodeId}`,
                source: markerNodeId,
                target: relationshipNodeId,
                type: "straight",
                sourceHandle: "spouse-right-source",
                targetHandle: "left",
                style: { strokeWidth: 2 },
              },
              {
                id: `edge-${relationshipNodeId}-${node.id}`,
                source: relationshipNodeId,
                target: node.id,
                type: "straight",
                sourceHandle: "right-source",
                targetHandle: "spouse-left-target",
                style: { strokeWidth: 2 },
              },
            ]
          : [
              {
                id: `edge-${node.id}-${relationshipNodeId}`,
                source: node.id,
                target: relationshipNodeId,
                type: "straight",
                sourceHandle: "spouse-right-source",
                targetHandle: "left",
                style: { strokeWidth: 2 },
              },
              {
                id: `edge-${relationshipNodeId}-${markerNodeId}`,
                source: relationshipNodeId,
                target: markerNodeId,
                type: "straight",
                sourceHandle: "right-source",
                targetHandle: "left",
                style: { strokeWidth: 2 },
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
              targetHandle:
                mode === "ancestors"
                  ? "right"
                  : "top-target",
              pathOptions: { borderRadius: 30 },
              style: { strokeWidth: 2 },
            };
          })
      );
      return [...directEdges, ...childEdges];
    }
  );
console.log("familyEdges:", familyEdges);
console.log("multiplePartnerEdges:", multiplePartnerEdges);
  return [...familyEdges, ...multiplePartnerEdges];
};