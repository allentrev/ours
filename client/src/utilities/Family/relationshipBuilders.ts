import type { Node } from "@xyflow/react";

import type {
  TreeMode,
  TreeResponseFamily,
} from "../../types/familyTypes";

import * as TREE from "../../constants/familyTree.constants";

import {
  getDisplayNodeId,
} from "./utils";

interface BuildRelationshipNodesArgs {
  mode: TreeMode;
  personNodes: Node[];
  visibleFamilies: TreeResponseFamily[];
  selectedFamilies: TreeResponseFamily[];
  hiddenIds: string[];
  useExpandedLayout: boolean;
  selectedPersonHandle: string;
  multiPartnerBaseNodes: Node[];
}

export const buildRelationshipNodes = ({
  mode,
  personNodes,
  visibleFamilies,
  selectedFamilies,
  hiddenIds,
  useExpandedLayout,
  selectedPersonHandle,
  multiPartnerBaseNodes,
}: BuildRelationshipNodesArgs): {
  relationshipNodes: Node[];
  multiPartnerRelationshipNodes: Node[];
} => {
  const relationshipNodes: Node[] = visibleFamilies.flatMap((family) => {
    if (
      useExpandedLayout &&
      selectedFamilies.includes(family)
    ) {
      return [];
    }

    if (!family.fatherHandle || !family.motherHandle) {
      return [];
    }

    if (
      hiddenIds.includes(family.fatherHandle) ||
      hiddenIds.includes(family.motherHandle)
    ) {
      return [];
    }

    const fatherNode = personNodes.find(
      (node) =>
        node.id ===
        getDisplayNodeId(
          family.fatherHandle!,
          selectedPersonHandle,
          family.id,
          useExpandedLayout
        )
    );

    const motherNode = personNodes.find(
      (node) =>
        node.id ===
        getDisplayNodeId(
          family.motherHandle!,
          selectedPersonHandle,
          family.id,
          useExpandedLayout
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

  const multiPartnerRelationshipNodes: Node[] =
    multiPartnerBaseNodes.flatMap((node) => {
      if (mode === "ancestors") {
        return [];
      }

      const spouseHandle = node.id.slice(17);

      const spouseNode = personNodes.find(
        (item) => item.id === spouseHandle
      );

      if (!spouseNode) {
        return [];
      }

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

  return {
    relationshipNodes,
    multiPartnerRelationshipNodes,
  };
};