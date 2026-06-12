import type { TreeResponseNode } from "../../types/familyTypes";
import type { LayoutContext } from "./layoutTypes";

export const orderFamilyBlocks = (
  context: LayoutContext,
  visibleWorkNodes: TreeResponseNode[]
): TreeResponseNode[] => {
  const nodesById = new Map(
    visibleWorkNodes.map((node) => [node.id, node])
  );

  const ordered: TreeResponseNode[] = [];
  const usedIds = new Set<string>();

  visibleWorkNodes.forEach((node) => {
    if (usedIds.has(node.id)) return;

    const family = context.visibleFamilies.find(
      (item) =>
        item.fatherHandle === node.id ||
        item.motherHandle === node.id
    );

    if (!family || !family.fatherHandle || !family.motherHandle) {
      ordered.push(node);
      usedIds.add(node.id);
      return;
    }

    const fatherNode = nodesById.get(family.fatherHandle);
    const motherNode = nodesById.get(family.motherHandle);

    if (
      !fatherNode ||
      !motherNode ||
      fatherNode.depth !== motherNode.depth
    ) {
      ordered.push(node);
      usedIds.add(node.id);
      return;
    }

    ordered.push(fatherNode, motherNode);
    usedIds.add(fatherNode.id);
    usedIds.add(motherNode.id);
  });

  return ordered;
};