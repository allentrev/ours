import type { Node } from "@xyflow/react";
import type { Edge } from "@xyflow/react";

import type {
  FamilyTreeMode,
  FamilyTreeResponse,
} from "../types/familyTypes";

import {
  LEVEL_HEIGHT,
  NODE_WIDTH,
  PERSON_CARD_HEIGHT,
  PERSON_CARD_WIDTH,
  RELATIONSHIP_NODE_SIZE,
  RELATIONSHIP_OFFSET_X,
} from "../constants/familyTree.constants";

export const buildFamilyTreeNodes = (
  data: FamilyTreeResponse,
  selectedPersonHandle: string,
  mode: FamilyTreeMode
): Node[] => {
  const nodesByDepth = data.nodes.reduce<Record<number, typeof data.nodes>>(
    (acc, node) => {
      if (!acc[node.depth]) acc[node.depth] = [];

      acc[node.depth].push(node);

      return acc;
    },
    {}
  );

  const personNodes: Node[] = data.nodes.map((node) => {
    const generation = nodesByDepth[node.depth];

    const indexInGeneration = generation.findIndex(
      (item) => item.id === node.id
    );

    const generationWidth =
      generation.length * NODE_WIDTH;

    return {
      id: node.id,
      type: "person",

      position: {
        x:
          indexInGeneration *
            NODE_WIDTH -
          generationWidth / 2,

        y:
          mode === "ancestors"
            ? -node.depth *
              LEVEL_HEIGHT
            : node.depth *
              LEVEL_HEIGHT,
      },

      data: {
        label: node.label,
        gender: node.gender,
        birthDate: node.birthDate,
        deathDate: node.deathDate,
        isSelected:
          node.id === selectedPersonHandle,
      },
    };
  });

  const FAMILY_RELATIONSHIP_OFFSET_X = 90;

  const familyCountByPerson = new Map<
    string,
    number
  >();

  data.families?.forEach((family) => {
    [family.fatherHandle, family.motherHandle].forEach(
      (handle) => {
        if (!handle) return;

        familyCountByPerson.set(
          handle,
          (familyCountByPerson.get(handle) ??
            0) + 1
        );
      }
    );
  });

  const familyIndexByPerson = new Map<
    string,
    number
  >();

  const getRelationshipOffsetX = (
    family: NonNullable<
      FamilyTreeResponse["families"]
    >[number]
  ) => {
    const sharedHandle = [
      family.fatherHandle,
      family.motherHandle,
    ].find(
      (handle) =>
        handle &&
        familyCountByPerson.get(handle) === 2
    );

    if (!sharedHandle) return 0;

    const currentIndex =
      familyIndexByPerson.get(sharedHandle) ??
      0;

    familyIndexByPerson.set(
      sharedHandle,
      currentIndex + 1
    );

    return currentIndex === 0
      ? -FAMILY_RELATIONSHIP_OFFSET_X
      : FAMILY_RELATIONSHIP_OFFSET_X;
  };

  const relationshipNodes: Node[] =
    data.families?.flatMap((family) => {
      const fatherNode = personNodes.find(
        (node) =>
          node.id === family.fatherHandle
      );

      const motherNode = personNodes.find(
        (node) =>
          node.id === family.motherHandle
      );

      if (!fatherNode || !motherNode)
        return [];

      const offsetX =
        getRelationshipOffsetX(family);

      return [
        {
          id: `relationship-${family.id}`,

          type: "relationship",

          position: {
            x:
              (fatherNode.position.x +
                PERSON_CARD_WIDTH /
                  2 +
                motherNode.position.x +
                PERSON_CARD_WIDTH /
                  2) /
                2 -
              RELATIONSHIP_NODE_SIZE /
                2 +
              offsetX,

            y:
              fatherNode.position.y +
              PERSON_CARD_HEIGHT /
                2 -
              RELATIONSHIP_NODE_SIZE /
                2,
          },

          data: {},
        },
      ];
    }) ?? [];

  return [
    ...personNodes,
    ...relationshipNodes,
  ];
};

export const buildFamilyTreeEdges = (
  data: FamilyTreeResponse
): Edge[] => {
  const familyEdges: Edge[] =
    data.families?.flatMap((family) => {
      const relationshipNodeId = `relationship-${family.id}`;

      const parentHandles = [
        family.fatherHandle,
        family.motherHandle,
      ].filter(Boolean) as string[];

      if (parentHandles.length === 1) {
        return family.childHandles.map((childHandle) => ({
          id: `edge-${parentHandles[0]}-${childHandle}`,
          source: parentHandles[0],
          target: childHandle,
          type: "smoothstep",
          sourceHandle: "bottom-source",
          targetHandle: "top-target",
          pathOptions: {
            borderRadius: 30,
          },
          style: {
            strokeWidth: 2,
          },
        }));
      }

      if (parentHandles.length === 2) {
        const [fatherHandle, motherHandle] = parentHandles;

        const spouseEdges: Edge[] = [
          {
            id: `edge-${fatherHandle}-${relationshipNodeId}`,
            source: fatherHandle,
            target: relationshipNodeId,
            type: "straight",
            sourceHandle: "spouse-right",
            targetHandle: "left",
            style: {
              strokeWidth: 2,
            },
          },
          {
            id: `edge-${motherHandle}-${relationshipNodeId}`,
            source: motherHandle,
            target: relationshipNodeId,
            type: "straight",
            sourceHandle: "spouse-left",
            targetHandle: "right-targt",
            style: {
              strokeWidth: 2,
            },
          },
        ];

        const childEdges: Edge[] = family.childHandles.map((childHandle) => ({
          id: `edge-${relationshipNodeId}-${childHandle}`,
          source: relationshipNodeId,
          target: childHandle,
          type: "smoothstep",
          sourceHandle: "bottom",
          targetHandle: "top-target",
          pathOptions: {
            borderRadius: 30,
          },
          style: {
            strokeWidth: 2,
          },
        }));

        return [...spouseEdges, ...childEdges];
      }

      return [];
    }) ?? [];

  return familyEdges;
};

