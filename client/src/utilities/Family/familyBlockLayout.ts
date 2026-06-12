import type { Node } from "@xyflow/react";

import type { LayoutContext } from "./layoutTypes";
import * as TREE from "../../constants/familyTree.constants";

const SPOUSE_GAP = 80;

interface Args {
  context: LayoutContext;
  personNodes: Node[];
}

export const positionSelectedFamilyBlocks = ({
  context,
  personNodes,
}: Args): Node[] => {
  const {
    selectedPersonHandle,
    selectedFamilies,
    useExpandedLayout,
  } = context;

  if (!useExpandedLayout) {
    return personNodes;
  }

  const selectedNode = personNodes.find(
    (node) => node.id === selectedPersonHandle
  );

  if (!selectedNode) {
    return personNodes;
  }

  const selectedFamiliesWithSpouses = selectedFamilies
    .map((family) => {
      const spouseHandle =
        family.fatherHandle === selectedPersonHandle
          ? family.motherHandle
          : family.motherHandle === selectedPersonHandle
            ? family.fatherHandle
            : undefined;

      return {
        family,
        spouseHandle,
      };
    })
    .filter(
      (item): item is typeof item & { spouseHandle: string } =>
        Boolean(item.spouseHandle)
    );

  if (selectedFamiliesWithSpouses.length < 2) {
    return personNodes;
  }

  const selectedCenterX =
    selectedNode.position.x + TREE.PERSON_CARD_WIDTH / 2;

  const leftX =
    selectedCenterX -
    TREE.PERSON_CARD_WIDTH -
    SPOUSE_GAP -
    TREE.PERSON_CARD_WIDTH / 2;

  const rightX =
    selectedCenterX +
    TREE.PERSON_CARD_WIDTH / 2 +
    SPOUSE_GAP;

  const spousePositions = new Map<string, number>();

  selectedFamiliesWithSpouses.forEach((item, index) => {
    spousePositions.set(
      item.spouseHandle,
      index === 0 ? leftX : rightX
    );
  });

  return personNodes.map((node) => {
    const newX = spousePositions.get(node.id);

    if (newX === undefined) {
      return node;
    }

    return {
      ...node,
      position: {
        ...node.position,
        x: newX,
        y: selectedNode.position.y,
      },
    };
  });
};