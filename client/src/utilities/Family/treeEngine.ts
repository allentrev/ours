import type { Edge, Node } from "@xyflow/react";

import type {
  TreeMode,
  TreeResponse,
  TreeResponseNode,
} from "../../types/familyTypes";

import { positionSelectedFamilyBlocks } from "./familyBlockLayout";
import { orderFamilyBlocks } from "./familyBlockOrdering";

import { buildLayoutContext } from "./contextBuilder";

import { manageTwoPartnerPersons } from "./spouseHelpers";

import { buildAncestorWorkNodes } from "./ancestorProcessor";
import { buildDescendantWorkNodes } from "./descendantProcessor";

import { buildPersonNodes } from "./nodeBuilders";
import { buildRelationshipNodes } from "./relationshipBuilders";
import { buildTreeEdges } from "./edgeBuilders";

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

  /////if (!selectedPersonNode) { return { nodes: [], edges: [] }; } 

  const context = buildLayoutContext(data, mode);

  if (!context) {
    return {
        nodes: [],
        edges: [],
    };
  }
  
  const {
    selectedPersonHandle,

    visibleFamilies,

    selectedPersonHiddenSpouseIds,

    initialNodes,
  } = context;


    // --------------------------------------------------
    // Work nodes
    // --------------------------------------------------
    let workNodes: TreeResponseNode[] = [...data.nodes];
    let visibleWorkNodes: TreeResponseNode[] = [];
    let visibleworkNodeIds = new Set<string>();
  ;
    // --------------------------------------------------
    // Hide spouses
    // --------------------------------------------------
    visibleWorkNodes =
        workNodes.filter(
            (node) =>
                !selectedPersonHiddenSpouseIds.includes(
                    node.id
                )
        );

    visibleworkNodeIds =
        new Set(
            visibleWorkNodes.map(
                (node) => node.id
            )
        );

    // --------------------------------------------------
    // Two-partner processing
    // --------------------------------------------------
    const result = 
      manageTwoPartnerPersons(
        workNodes,
        visibleFamilies,
        visibleworkNodeIds,
        initialNodes
      );
  
    visibleWorkNodes = result.visibleWorkNodes;
    visibleworkNodeIds = result.visibleworkNodeIds;
  // --------------------------------------------------
  // Processors
  // --------------------------------------------------
  // A) Ancestors
  // ----------------------------------------------------------
  if (mode === "ancestors") {
    const result = buildAncestorWorkNodes(
      context,
      workNodes
    );

    workNodes = result.workNodes;
    visibleWorkNodes = result.visibleWorkNodes;
  }

  // -------------------------------------------------------
  // B) Descendants
  // ----------------------------------------------------------
  if (mode === "descendants") {
    visibleWorkNodes = buildDescendantWorkNodes(
      context,
      visibleWorkNodes
    );
  }
  //-------------------------- end of section -----------------------------------
  visibleWorkNodes = orderFamilyBlocks(
    context,
    visibleWorkNodes
  );

  visibleworkNodeIds = new Set(
    visibleWorkNodes.map((node) => node.id)
  );

  // ----------------------------------------------------------
  // React Flow Nodes
  // ----------------------------------------------------------

  const {
    personNodes: rawPersonNodes,
    multiPartnerBaseNodes,
  } = buildPersonNodes(
    visibleWorkNodes,
    selectedPersonHandle,
    mode
  );
  const personNodes = positionSelectedFamilyBlocks({
    context,
    personNodes: rawPersonNodes,
  });
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

  // ----------------------------------------------------------
  // React Flow Edges
  // ----------------------------------------------------------
  mappedEdges = buildTreeEdges(
    context,
    multiPartnerBaseNodes
  );
  // ----------------------------------------------------------
  // Return graph
  // ----------------------------------------------------------

  return { nodes: mappedNodes, edges: mappedEdges };
};