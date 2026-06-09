import type { Edge, Node } from "@xyflow/react";

import type {
  TreeMode,
  TreeResponse,
  TreeResponseNode,
  TreeResponseFamily,
} from "../../types/familyTypes";

import {
  buildAncestorTree
} from "./ancestorHelpers";

import {
  getSpouseNodesForPerson,
  getMultiPartnerSpouseMap,
  manageTwoPartnerPersons
} from "./spouseHelpers";


import * as TREE from "../../constants/familyTree.constants";

//console.log("buildImport");


const getDisplayNodeId = (
  personHandle: string,
  selectedPersonHandle: string,
  familyId: string,
  useExpandedLayout: boolean
) => {
  // --------------------------------------------------
  // Helper function for relationship nodes:
  //
  // --------------------------------------------------    
  if (
    useExpandedLayout &&
    personHandle === selectedPersonHandle
  ) {
    return `${personHandle}::${familyId}`;
  }

  return personHandle;
};

const getFamilyId = (
  personHandle: string,
  selectedFamilies: TreeResponseFamily[] | undefined
) => {
  const result = selectedFamilies?.find( item =>
     (item.fatherHandle === personHandle || item.motherHandle === personHandle) )?.id;

  return result ? result : "";   
}

// --------------------------------------------------
// Main function to build nodes for the family tree
// --------------------------------------------------
export const buildTree = (
  data: TreeResponse,
  mode: TreeMode
): { nodes: Node[]; edges: Edge[] } => {

  //console.log("buildTreee");

  // --------------------------------------------------
  // INitialisation and preprocessing:
  //  - Find selected person node and determine if they have >2 partners
  //  - Determine if we need to use the expanded selected partner layout
  //  - Get list of hidden spouse handles based on multi-partner logic
  // --------------------------------------------------
  let mappedNodes: Node[] = [];
  let mappedEdges: Edge[] = [];

  const selectedPersonHandle = data.selectedPerson.handle;

  const selectedPersonNode = data.nodes.find(
    (node) => node.id === selectedPersonHandle
  );
  if (!selectedPersonNode) { return { nodes: [], edges: [] }; } 

  //console.log("Input data nodes:", data.nodes);

  const selectedNoPartners = selectedPersonNode?.noPartners ?? 0;

  const useExpandedLayout =
    mode === "descendants" && selectedNoPartners > 2;

  let workNodes: TreeResponseNode[] = [...data.nodes];
  const workNodeIds = new Set(workNodes.map((node) => node.id));
  const initialNodes = [...data.nodes];

  let visibleWorkNodes:TreeResponseNode[] = [];
  let visibleworkNodeIds: Set<string> = new Set<string>();

  // --------------------------------------------------
  // Determine which families are visible based on the visible person nodes
  // This is important for determining where to place relationship nodes and
  // how to handle multi-partner logic
  //
  // Depends on workNodeIds
  // --------------------------------------------------
  const visibleFamilies =
    // this removes the familybelonging to the selected person and their spouse from
    // list of visible families
    data.families?.filter((family) => {                   // ensure at least one parent is visible
      if (!family.fatherHandle && !family.motherHandle) {
        return false;
      }

      const parentHandles = [                             // remove any null/undefined handles
        family.fatherHandle,
        family.motherHandle,
      ].filter(Boolean) as string[];

      return parentHandles.some((parentHandle) =>
        workNodeIds.has(parentHandle)
      );
    }) ?? [];
    
  //  the set of families with the selected person as a parent
  const selectedFamilies = visibleFamilies.filter(
    (family) =>
      family.fatherHandle === selectedPersonHandle ||
      family.motherHandle === selectedPersonHandle
  );

  const hiddenSpouseHandles = getMultiPartnerSpouseMap(
    data,
    mode,
  );
  
  // 1. Find the entry object that contains the selected handle as a key
  const matchedEntry = hiddenSpouseHandles.find(
    (entry) => selectedPersonHandle in entry
  );
  // 2. Extract the array of strings safely
  const selectedPersonHiddenSpouseIds: string[] = matchedEntry ? matchedEntry[selectedPersonHandle] : [];

  const hiddenSpouseNodes = initialNodes.filter((item) => selectedPersonHiddenSpouseIds.includes(item.id));
  visibleWorkNodes = workNodes.filter((node) => !selectedPersonHiddenSpouseIds.includes(node.id))  //take away hidden spouse ids

  const hiddenIds: string[] = hiddenSpouseHandles.flatMap((entry) =>
        Object.values(entry).flat()
  );
  //console.log("Hidden Ids:", [...hiddenIds]);  
  visibleworkNodeIds = new Set(
    visibleWorkNodes.map((node) => node.id)
  );
  
  //console.log("Visible work nodes before:", visibleWorkNodes);
  const result = manageTwoPartnerPersons(workNodes, visibleFamilies, visibleworkNodeIds, initialNodes);
  visibleWorkNodes = result.visibleWorkNodes;
  visibleworkNodeIds = result.visibleworkNodeIds;
  //console.log("Visible work nodes after management:", visibleWorkNodes);

  //console.log("initial Nodes", initialNodes);
  //console.log("Hidden spouse handles:", [...hiddenSpouseHandles]);
  //console.log("Hidden IDs:", [...hiddenIds]);
  //console.log("selectedPersonHiddenSpouseIds", selectedPersonHiddenSpouseIds);
  //console.log("Hidden spouse nodes:", [...hiddenSpouseNodes]);
  //console.log("visibleWOrkNodes", [...visibleWorkNodes]);
  //console.log("flattended spouse Ids:", flattenedselectedPersonHiddenSpouseIds);

  //console.log("Visible families:", visibleFamilies);
  //console.log("Selected families:", selectedFamilies);
  let offSet = 0;
  // --------------------------------------------------
  // Build workNodes based on mode:
  if (mode === "ancestors") {
    //if (selectedNoPartners> 2) {
      // add multi partner Node with No Partners = selectedNoPartners
    //}
    const ancestorNodes = buildAncestorTree(data);
    workNodes = [...workNodes, ...ancestorNodes];
    const spouseNodes = getSpouseNodesForPerson(
      selectedPersonHandle,
      data,
      0
    );
    //console.log("ancestor, selectedPerson, spouseNodes");
    //console.log(ancestorNodes, selectedPersonNode, spouseNodes);
    visibleWorkNodes = [...ancestorNodes, selectedPersonNode, ...spouseNodes];
  }

  // -------------------------------------------------------
  // Set up visible work nodes:
  //  Descendants = workNodes minus hidden spouses
  //  Ancestors = all workNodes
  //
  // AT THIS POINT WORKNODES MUST BE FULLY POPULATED.
  //  2 partner person must be in the nodes as spouse 1 --- person ---spouse 2
  //  >2 partner person must be in the nodes as:
  //      a) for descendant of selected person: person --- MultiPartner 
  //      b) for ancestor of selected person: MultiPartner --- person --- ancestral other parent
  // In descendant mode, if the selected person has >2 partners, the expanded view will be shown
  // -------------------------------------------------------
  //console.log("Mode", mode);
  if (mode === "descendants") {
    //console.log("Descendants route + hiddenIds", hiddenIds);
    let filteredPersonNodes :TreeResponseNode[] = [];
    if (useExpandedLayout) {
      // remove the selected person node and replace with a 
      // multiple person node for eachfamily they are in
      // calculate the depth offset
      // add the children nodes

      filteredPersonNodes = visibleWorkNodes.filter(
        (node) => node.id !== selectedPersonHandle && !selectedPersonHiddenSpouseIds.includes(node.id)
      );
      //console.log("FilteredPersonNodes", filteredPersonNodes);
      
      let wDepth = 0;
      const expandedSet: TreeResponseNode[] = [];
      hiddenSpouseNodes.forEach((spouseNode) => {
        const familyId = getFamilyId(spouseNode.id, selectedFamilies);
        //console.log("Family ID for spouse node:", familyId, spouseNode);
        spouseNode.depth = wDepth;
        const dummyNode:TreeResponseNode = {
          id: `multiple-partner-${selectedPersonHandle}::${familyId}`,
          label: selectedPersonNode.label,
          gender: selectedPersonNode.gender,
          birthDate: selectedPersonNode.birthDate,
          deathDate: selectedPersonNode.deathDate,
          depth: wDepth,
          noPartners: 1,
        }
        expandedSet.push(dummyNode, spouseNode);
        wDepth += 1;
      })
      //console.log("expanded set", [...expandedSet]);
      offSet = wDepth - 1;
      const updatedFilteredPersonNodes = filteredPersonNodes.map((item) => ({
        ...item,
        depth: item.depth + offSet
      }));
      visibleWorkNodes = [...expandedSet, ...updatedFilteredPersonNodes];
      //console.log("Visible work nodes after expanded layout processing:", visibleWorkNodes);  
      //const expandedNodeSet = [...repeatedSelectedNodes, ...hiddenSpouseNodes]
      //  console.log("Expanded node set for multi-partner selected person:", expandedNodeSet);
    } else {
      // normaldescendants - remove multiple spouse nodes and replace bya single multiple partner node
      const multiplePartnerNodes: TreeResponseNode[] = [];
      hiddenSpouseHandles.forEach((entry) => {
        Object.entries(entry).forEach(([key]) => {
          const spouseNode = initialNodes.find((node) => node.id === key);
          if (!spouseNode) return; 
          //console.log("Item in hidden spouse handles", key, spouseNode);
          const dummyPerson: TreeResponseNode = {
            id: `multiple-partner-${key}`,
            label: "Dummy",
            gender: spouseNode.gender === "M" ? "F" : "M",
            birthDate: "",
            deathDate: "",
            depth: spouseNode.depth ?? 0, 
            noPartners: spouseNode.noPartners ?? 1,
          };
          multiplePartnerNodes.push(dummyPerson);
        })
      })
      //console.log("multiplePartnerNodes", multiplePartnerNodes);
      filteredPersonNodes = visibleWorkNodes.filter((node) => !hiddenIds.includes(node.id))
      visibleWorkNodes = [...filteredPersonNodes, ...multiplePartnerNodes]; 
      //console.log("normal filteredPersonNodes", visibleWorkNodes);
    }
  }

    //-------------------------- end of section -----------------------------------
  
    //visibleWorkNodes = workNodes.filter((node) => !hiddenIds.has(node.id))  //take away hidden ids

  visibleworkNodeIds = new Set(
    visibleWorkNodes.map((node) => node.id)
  );

  // ----------------------------------------------------------
  // Now process the visibleworkNodes to produce the final nodes for React Flow 
  // Produce Output nodes for React Flow
  const nodesByDepth = visibleWorkNodes.reduce<
    Record<number, typeof data.nodes>
  >((acc, node) => {
    if (!acc[node.depth]) {
      acc[node.depth] = [];
    }

    acc[node.depth].push(node);

    return acc;
  }, {});

  const multiPartnerBaseNodeHandles: string[] = [];
  const multiPartnerBaseNodes: Node[] = [];

  const personNodes: Node[] = visibleWorkNodes.map((node) => {
    const generation = nodesByDepth[node.depth];

    const indexInGeneration = generation.findIndex(
      (item) => item.id === node.id
    );

    const generationWidth = generation.length * TREE.NODE_WIDTH;

    const wIdRoot = node.id.slice(17); // remove "dummy-" prefix to get original id for multi-partner nodes
    const wNodeId = (node.label === "Dummy") ? `multiple-partner-${wIdRoot}` : node.id;
    const wType = (node.label === "Dummy") ? "multiplePartner" : "person";
    const wLabel = (node.label === "Dummy") ? "Multiple Partners" : node.label;
    if (node.label === "Dummy") {
      //console.log(node.id, wIdRoot, wNodeId, wType, wLabel);
      multiPartnerBaseNodeHandles.push(node.id);
    }

    return {
      id: wNodeId,
      type: wType,
      position: {
        x: indexInGeneration * TREE.NODE_WIDTH - generationWidth / 2,
        y:
          mode === "ancestors"
            ? -node.depth * TREE.LEVEL_HEIGHT
            : node.depth * TREE.LEVEL_HEIGHT,
      },
      data: {
        label: wLabel,
        shortId: node.id.slice(-4),
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
  multiPartnerBaseNodeHandles.forEach ((nodeId) => {
    const dummyNode = personNodes.filter( item => item.id === nodeId)
    multiPartnerBaseNodes.push(...dummyNode);
  })

  //console.log("Nodes  by depth", nodesByDepth);
  //console.log("Person nodes after initial layout:", personNodes);
  //console.log("MultiPartner Base Nodes", multiPartnerBaseNodes);

  // --------------------------------------------------
  // Now insert relationship nodes for families where both parents are visible and not hidden due to multi-partner logic
  // --------------------------------------------------
  const relationshipNodes: Node[] = visibleFamilies.flatMap((family) => {
    //console.log("iterate familties", family.fatherHandle, family.motherHandle);
    if (
      useExpandedLayout &&
      selectedFamilies.includes(family)
    ) {
      //console.log("1");
      return [];
    }

    if (!family.fatherHandle || !family.motherHandle) {
      //console.log("2");
      return [];
    }

    if (
      hiddenIds.includes(family.fatherHandle) ||
      hiddenIds.includes(family.motherHandle)
    ) {
      //console.log("3");
      return [];
    }
    
    const fatherNode = personNodes.find(
      (node) =>
        node.id === getDisplayNodeId(family.fatherHandle!, selectedPersonHandle, family.id, useExpandedLayout)
    );

    const motherNode = personNodes.find(
      (node) =>
        node.id === getDisplayNodeId(family.motherHandle!, selectedPersonHandle, family.id, useExpandedLayout)
    );

    if (!fatherNode || !motherNode) {
      //console.log("4");
      return [];
    }
    //console.log("5");
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
  const multiPartnerRelationshipNodes: Node[] = multiPartnerBaseNodes.flatMap((node) => {
    // hmmmm
    //console.log("iterate multiOartner,,,", node);
    if (mode === "ancestors") return [];
    const wSpouseHandle = node.id.slice(17);
    //console.log("spouse Handle", wSpouseHandle);
    const spouseNode = personNodes.find( item => item.id === wSpouseHandle);
    if (!spouseNode){ return [] };
    //console.log("Spouse node", spouseNode)
    return [
      {
        id: `relationship-${node.id}`,
        type: "relationship",
        position: {
          x:
            (node.position.x +
              TREE.PERSON_CARD_WIDTH / 2 +
              spouseNode.position.x +
              TREE.PERSON_CARD_WIDTH / 2) /
            2 -
            TREE.RELATIONSHIP_NODE_SIZE / 2,
          y:
            node.position.y +
            TREE.PERSON_CARD_HEIGHT / 2 -
            TREE.RELATIONSHIP_NODE_SIZE / 2,
        },
        data: {},
      },
    ];
  });

  //console.log("Final person nodes:", personNodes);
  //console.log("Relationship nodes:", relationshipNodes);
  //console.log("Multiple partner nodes:", multiplePartnerNodes);
  //console.log("Multiple partner relationship nodes:", multiPartnerRelationshipNodes);
  mappedNodes = [
    ...personNodes,
    ...relationshipNodes,
    ...multiPartnerRelationshipNodes
  ];

//TODO help
  const buildTreeEdges = (
    data: TreeResponse,
    mode: TreeMode
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

  mappedEdges = buildTreeEdges(
    data,
    mode
  );
  //console.log("Final return");

  return { nodes: mappedNodes, edges: mappedEdges };
};