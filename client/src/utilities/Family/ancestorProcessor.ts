import type { TreeResponseNode } from "../../types/familyTypes";

import type { LayoutContext } from "./layoutTypes";

import { buildAncestorTree } from "./ancestorHelpers";
import { getSpouseNodesForPerson } from "./spouseHelpers";

export const buildAncestorWorkNodes = (
  context: LayoutContext,
  workNodes: TreeResponseNode[]
): {
  workNodes: TreeResponseNode[];
  visibleWorkNodes: TreeResponseNode[];
} => {
  const {
    data,
    selectedPersonHandle,
    selectedPersonNode,
  } = context;

  const ancestorNodes = buildAncestorTree(data);

  const updatedWorkNodes = [
    ...workNodes,
    ...ancestorNodes,
  ];

  const spouseNodes = getSpouseNodesForPerson(
    selectedPersonHandle,
    data,
    0
  );

  const visibleWorkNodes = [
    ...ancestorNodes,
    selectedPersonNode,
    ...spouseNodes,
  ];

  return {
    workNodes: updatedWorkNodes,
    visibleWorkNodes,
  };
};