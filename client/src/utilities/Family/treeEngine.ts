import type { Edge, Node } from "@xyflow/react";

import type {
  TreeMode,
  TreeResponse,
  TreeResponseNode,
} from "../../types/familyTypes";

import type { LayoutContext } from "./layoutTypes";

import {
  buildAncestorTree
} from "./ancestorHelpers";

import {
  getSpouseNodesForPerson,
  getMultiPartnerSpouseMap,
  manageTwoPartnerPersons
} from "./spouseHelpers";

import { buildPersonNodes } from "./nodeBuilders";
import { buildRelationshipNodes } from "./relationshipBuilders";
import { buildTreeEdges } from "./edgeBuilders";

import {
  getFamilyId,
} from "./utils";


//console.log("buildImport");


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
  // --------------------------------------------------
  // Layout Context
  // --------------------------------------------------
  const selectedPersonHandle = data.selectedPerson.handle;
  const selectedPersonNode = data.nodes.find((node) => node.id === selectedPersonHandle);
  const selectedNoPartners = selectedPersonNode?.noPartners ?? 0;
  const useExpandedLayout = mode === "descendants" && selectedNoPartners > 2;

  let workNodes: TreeResponseNode[] = [...data.nodes];
  const workNodeIds = new Set(workNodes.map((node) => node.id));
  const initialNodes = [...data.nodes];
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

  let visibleWorkNodes:TreeResponseNode[] = [];
  let visibleworkNodeIds: Set<string> = new Set<string>();

  
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

  if (!selectedPersonNode) { return { nodes: [], edges: [] }; } 

  //console.log("Input data nodes:", data.nodes);

  const context: LayoutContext = {
    data,
    mode,

    selectedPersonHandle,
    selectedPersonNode,
    selectedNoPartners,
    useExpandedLayout,

    visibleFamilies,
    selectedFamilies,

    hiddenSpouseHandles,
    selectedPersonHiddenSpouseIds,
    hiddenIds,

    initialNodes,
  };



  // --------------------------------------------------
  // Determine which families are visible based on the visible person nodes
  // This is important for determining where to place relationship nodes and
  // how to handle multi-partner logic
  //
  // Depends on workNodeIds
  // --------------------------------------------------

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

  const {
    personNodes,
    multiPartnerBaseNodes,
  } = buildPersonNodes(
    visibleWorkNodes,
    selectedPersonHandle,
    mode
  );
  //console.log("Nodes  by depth", nodesByDepth);
  //console.log("Person nodes after initial layout:", personNodes);
  //console.log("MultiPartner Base Nodes", multiPartnerBaseNodes);

  const {
    relationshipNodes,
    multiPartnerRelationshipNodes,
  } = buildRelationshipNodes({
    context,
    personNodes,
    multiPartnerBaseNodes,
  });
  
  mappedNodes = [
    ...personNodes,
    ...relationshipNodes,
    ...multiPartnerRelationshipNodes
  ];

//TODO help
  mappedEdges = buildTreeEdges(
    context,
    multiPartnerBaseNodes
  );
  //console.log("Final return");

  return { nodes: mappedNodes, edges: mappedEdges };
};