import type { Node } from "@xyflow/react";
import type { TreeMode, TreeResponseNode } from "../../types/familyTypes";
import * as TREE from "../../constants/familyTree.constants";

export const buildPersonNodes = (
  visibleWorkNodes: TreeResponseNode[],
  selectedPersonHandle: string,
  mode: TreeMode
): {
  personNodes: Node[];
  multiPartnerBaseNodes: Node[];
} => {
  const nodesByDepth = visibleWorkNodes.reduce<
    Record<number, TreeResponseNode[]>
  >((acc, node) => {
    if (!acc[node.depth]) acc[node.depth] = [];
    acc[node.depth].push(node);
    return acc;
  }, {});

  const multiPartnerBaseNodeHandles: string[] = [];

  const personNodes: Node[] = visibleWorkNodes.map((node) => {
    const generation = nodesByDepth[node.depth];

    const indexInGeneration = generation.findIndex(
      (item) => item.id === node.id
    );

    const generationWidth = generation.length * TREE.NODE_WIDTH;

    const wIdRoot = node.id.slice(17);
    const wNodeId =
      node.label === "Dummy"
        ? `multiple-partner-${wIdRoot}`
        : node.id;

    const wType =
      node.label === "Dummy"
        ? "multiplePartner"
        : "person";

    const wLabel =
      node.label === "Dummy"
        ? "Multiple Partners"
        : node.label;

    if (node.label === "Dummy") {
      multiPartnerBaseNodeHandles.push(wNodeId);
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
            ? Math.max(0, Number(node.noPartners ?? 0) - 1)
            : node.noPartners,
      },
    };
  });

  const multiPartnerBaseNodes: Node[] = [];

  multiPartnerBaseNodeHandles.forEach((nodeId) => {
    const dummyNode = personNodes.filter((item) => item.id === nodeId);
    multiPartnerBaseNodes.push(...dummyNode);
  });

  return {
    personNodes,
    multiPartnerBaseNodes,
  };
};