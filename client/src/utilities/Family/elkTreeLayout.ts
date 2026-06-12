import ELK from "elkjs/lib/elk.bundled.js";
import type { Edge, Node } from "@xyflow/react";

import * as TREE from "../../constants/familyTree.constants";

const elk = new ELK();

const RELATIONSHIP_Y_OFFSET =
  TREE.PERSON_CARD_HEIGHT + 10;

export const layoutTreeWithElk = async (
  nodes: Node[],
  edges: Edge[]
): Promise<Node[]> => {
  const layoutNodes = nodes.filter(
    (node) => node.type !== "relationship"
  );

  const layoutNodeIds = new Set(layoutNodes.map((node) => node.id));

  const layoutEdges = buildVirtualHierarchyEdges(
    edges,
    layoutNodeIds
  );

  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",

      "elk.spacing.nodeNode": "100",
      "elk.layered.spacing.nodeNodeBetweenLayers": "160",
      "elk.spacing.edgeNode": "50",
      "elk.spacing.edgeEdge": "30",

      "elk.edgeRouting": "ORTHOGONAL",
    },
    children: layoutNodes.map((node) => ({
      id: node.id,
      width: TREE.PERSON_CARD_WIDTH,
      height: TREE.PERSON_CARD_HEIGHT,
    })),
    edges: layoutEdges,
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    if (node.type === "relationship") {
      return node;
    }

    const layoutedNode = layoutedGraph.children?.find(
      (child) => child.id === node.id
    );

    if (!layoutedNode) return node;

    return {
      ...node,
      position: {
        x: layoutedNode.x ?? node.position.x,
        y: node.position.y,
      },
    };
  });
  
  //const spouseGroupedNodes = groupSpouses(layoutedNodes, edges);
  const spacedNodes = separateOverlappingRows(layoutedNodes);
  const centeredNodes = centerRows(spacedNodes);
  
  return repositionRelationshipNodes(centeredNodes, edges);
};

const buildVirtualHierarchyEdges = (
  edges: Edge[],
  layoutNodeIds: Set<string>
) => {
  const virtualEdges: {
    id: string;
    sources: string[];
    targets: string[];
  }[] = [];

  const relationshipToParents = new Map<string, string[]>();
  const relationshipToChildren = new Map<string, string[]>();

  edges.forEach((edge) => {
    const sourceIsRelationship = edge.source.startsWith("relationship-");
    const targetIsRelationship = edge.target.startsWith("relationship-");

    if (targetIsRelationship && layoutNodeIds.has(edge.source)) {
      const existing = relationshipToParents.get(edge.target) ?? [];
      relationshipToParents.set(edge.target, [...existing, edge.source]);
    }

    if (sourceIsRelationship && layoutNodeIds.has(edge.target)) {
      const existing = relationshipToChildren.get(edge.source) ?? [];
      relationshipToChildren.set(edge.source, [...existing, edge.target]);
    }

    if (
      !sourceIsRelationship &&
      !targetIsRelationship &&
      layoutNodeIds.has(edge.source) &&
      layoutNodeIds.has(edge.target)
    ) {
      virtualEdges.push({
        id: `elk-${edge.id}`,
        sources: [edge.source],
        targets: [edge.target],
      });
    }
  });

  relationshipToParents.forEach((parents, relationshipId) => {
    const children = relationshipToChildren.get(relationshipId) ?? [];

    parents.forEach((parentId) => {
      children.forEach((childId) => {
        virtualEdges.push({
          id: `elk-${relationshipId}-${parentId}-${childId}`,
          sources: [parentId],
          targets: [childId],
        });
      });
    });
  });

  return virtualEdges;
};

const repositionRelationshipNodes = (
  nodes: Node[],
  edges: Edge[]
): Node[] => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return nodes.map((node) => {
    if (node.type !== "relationship") {
      return node;
    }

    const partnerNodes = getRelationshipPartnerNodes(
      node.id,
      edges,
      nodeMap
    );

    if (partnerNodes.length < 2) {
      return node;
    }

    const [partnerA, partnerB] = partnerNodes;

    const partnerACenterX =
      partnerA.position.x + TREE.PERSON_CARD_WIDTH / 2;

    const partnerBCenterX =
      partnerB.position.x + TREE.PERSON_CARD_WIDTH / 2;

    return {
      ...node,
      position: {
        x:
          (partnerACenterX + partnerBCenterX) / 2 -
          TREE.RELATIONSHIP_NODE_SIZE / 2,

        y:
          Math.min(partnerA.position.y, partnerB.position.y) +
          RELATIONSHIP_Y_OFFSET,
      },
    };
  });
};

const getRelationshipPartnerNodes = (
  relationshipNodeId: string,
  edges: Edge[],
  nodeMap: Map<string, Node>
): Node[] => {
  const partnerIds = edges
    .filter(
      (edge) =>
        edge.type === "straight" &&
        (edge.source === relationshipNodeId ||
          edge.target === relationshipNodeId)
    )
    .map((edge) =>
      edge.source === relationshipNodeId ? edge.target : edge.source
    )
    .filter((nodeId) => {
      const node = nodeMap.get(nodeId);
      return node && node.type !== "relationship";
    });

  return [...new Set(partnerIds)]
    .map((id) => nodeMap.get(id))
    .filter(Boolean) as Node[];
};

const ROW_Y_TOLERANCE = 20;
const MIN_NODE_GAP = 60;

const separateOverlappingRows = (nodes: Node[]): Node[] => {
  const rows = new Map<number, Node[]>();

  nodes.forEach((node) => {
    if (node.type === "relationship") return;

    const rowKey =
      Math.round(node.position.y / ROW_Y_TOLERANCE) * ROW_Y_TOLERANCE;

    const existing = rows.get(rowKey) ?? [];
    rows.set(rowKey, [...existing, node]);
  });

  const adjustedPositions = new Map<string, number>();

  rows.forEach((rowNodes) => {
    const sortedNodes = [...rowNodes].sort(
      (a, b) => a.position.x - b.position.x
    );

    let nextX = sortedNodes[0]?.position.x ?? 0;

    sortedNodes.forEach((node) => {
      const requiredX = Math.max(node.position.x, nextX);

      adjustedPositions.set(node.id, requiredX);

      nextX =
        requiredX +
        TREE.PERSON_CARD_WIDTH +
        MIN_NODE_GAP;
    });
  });

  return nodes.map((node) => {
    const adjustedX = adjustedPositions.get(node.id);

    if (adjustedX === undefined) {
      return node;
    }

    return {
      ...node,
      position: {
        ...node.position,
        x: adjustedX,
      },
    };
  });
};

const centerRows = (nodes: Node[]): Node[] => {
  const rows = new Map<number, Node[]>();

  nodes.forEach((node) => {
    if (node.type === "relationship") return;

    const rowKey =
      Math.round(node.position.y / ROW_Y_TOLERANCE) * ROW_Y_TOLERANCE;

    const existing = rows.get(rowKey) ?? [];
    rows.set(rowKey, [...existing, node]);
  });

  const xOffsets = new Map<string, number>();

  rows.forEach((rowNodes) => {
    if (rowNodes.length === 0) return;

    const originalMinX = Math.min(
      ...rowNodes.map((node) => node.position.x)
    );

    const originalMaxX = Math.max(
      ...rowNodes.map(
        (node) => node.position.x + TREE.PERSON_CARD_WIDTH
      )
    );

    const originalCenter =
      (originalMinX + originalMaxX) / 2;

    const sortedNodes = [...rowNodes].sort(
      (a, b) => a.position.x - b.position.x
    );

    const spacedMinX = Math.min(
      ...sortedNodes.map((node) => node.position.x)
    );

    const spacedMaxX = Math.max(
      ...sortedNodes.map(
        (node) => node.position.x + TREE.PERSON_CARD_WIDTH
      )
    );

    const spacedCenter =
      (spacedMinX + spacedMaxX) / 2;

    const offset = originalCenter - spacedCenter;

    sortedNodes.forEach((node) => {
      xOffsets.set(node.id, offset);
    });
  });

  return nodes.map((node) => {
    const offset = xOffsets.get(node.id);

    if (offset === undefined) {
      return node;
    }

    return {
      ...node,
      position: {
        ...node.position,
        x: node.position.x + offset,
      },
    };
  });
};

const SPOUSE_GAP = 80;

const groupSpouses = (
  nodes: Node[],
  edges: Edge[]
): Node[] => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const updates = new Map<string, number>();

  const relationshipIds = nodes
    .filter((node) => node.type === "relationship")
    .map((node) => node.id);

  relationshipIds.forEach((relationshipId) => {
    const partners = getRelationshipPartnerNodes(
      relationshipId,
      edges,
      nodeMap
    );

    if (partners.length !== 2) return;

    const [partnerA, partnerB] = partners;

    const sameRow =
      Math.abs(partnerA.position.y - partnerB.position.y) <=
      ROW_Y_TOLERANCE;

    if (!sameRow) return;

    const leftPartner =
      partnerA.position.x <= partnerB.position.x
        ? partnerA
        : partnerB;

    const rightPartner =
      leftPartner.id === partnerA.id
        ? partnerB
        : partnerA;

    const leftX = leftPartner.position.x;
    const rightX =
      leftX + TREE.PERSON_CARD_WIDTH + SPOUSE_GAP;

    updates.set(leftPartner.id, leftX);
    updates.set(rightPartner.id, rightX);
  });

  return nodes.map((node) => {
    const updatedX = updates.get(node.id);

    if (updatedX === undefined) {
      return node;
    }

    return {
      ...node,
      position: {
        ...node.position,
        x: updatedX,
      },
    };
  });
};