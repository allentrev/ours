import type { TreeResponseNode } from "../../types/familyTypes";

import type { LayoutContext } from "./layoutTypes";

import { getFamilyId } from "./utils";

export const buildDescendantWorkNodes = (
  context: LayoutContext,
  visibleWorkNodes: TreeResponseNode[]
): TreeResponseNode[] => {
  
  const SPOUSE_DEPTH_OFFSET = 0;

  const {
    selectedPersonHandle,
    selectedPersonNode,
    useExpandedLayout,
    hiddenSpouseHandles,
    hiddenSpouseNodes,
    selectedPersonHiddenSpouseIds,
    hiddenIds,
    selectedFamilies,
    initialNodes,
  } = context;

  if (useExpandedLayout) {
    const filteredPersonNodes = visibleWorkNodes.filter(
      (node) =>
        node.id !== selectedPersonHandle &&
        !selectedPersonHiddenSpouseIds.includes(node.id)
    );

    let depth = 0;
    const expandedSet: TreeResponseNode[] = [];

    hiddenSpouseNodes.forEach((spouseNode) => {
      const familyId = getFamilyId(spouseNode.id, selectedFamilies);

      const spouseAtDepth = {
        ...spouseNode,
        depth,
      };

      const dummyNode: TreeResponseNode = {
        id: `multiple-partner-${selectedPersonHandle}::${familyId}`,
        label: selectedPersonNode.label,
        gender: selectedPersonNode.gender,
        birthDate: selectedPersonNode.birthDate,
        deathDate: selectedPersonNode.deathDate,
        depth,
        noPartners: 1,
      };

      expandedSet.push(dummyNode, spouseAtDepth);
      depth += 1;
    });

    const offset = depth - 1;

    const updatedFilteredPersonNodes = filteredPersonNodes.map((node) => ({
      ...node,
      depth: node.depth + offset,
    }));

    return [...expandedSet, ...updatedFilteredPersonNodes];
  }

  const multiplePartnerNodes: TreeResponseNode[] = [];

  hiddenSpouseHandles.forEach((entry) => {
    Object.entries(entry).forEach(([key]) => {
      const spouseNode = initialNodes.find((node) => node.id === key);

      if (!spouseNode) return;

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
    });
  });

  const filteredPersonNodes = visibleWorkNodes.filter(
    (node) => !hiddenIds.includes(node.id)
  );

  const visibleNodeIds = new Set(
    filteredPersonNodes.map((node) => node.id)
  );

  const spouseIdsToAdd = new Set<string>();

  context.visibleFamilies.forEach((family) => {
    const fatherVisible =
      family.fatherHandle &&
      visibleNodeIds.has(family.fatherHandle);

    const motherVisible =
      family.motherHandle &&
      visibleNodeIds.has(family.motherHandle);

    if (fatherVisible && family.motherHandle) {
      spouseIdsToAdd.add(family.motherHandle);
    }

    if (motherVisible && family.fatherHandle) {
      spouseIdsToAdd.add(family.fatherHandle);
    }
  });

  const spouseNodesToAdd = initialNodes
    .filter(
      (node) =>
        spouseIdsToAdd.has(node.id) &&
        !visibleNodeIds.has(node.id) &&
        !hiddenIds.includes(node.id)
    )
    .map((spouseNode) => {
      const family = context.visibleFamilies.find(
        (item) =>
          item.fatherHandle === spouseNode.id ||
          item.motherHandle === spouseNode.id
      );

      const partnerHandle =
        family?.fatherHandle === spouseNode.id
          ? family.motherHandle
          : family?.fatherHandle;

      const partnerNode = filteredPersonNodes.find(
        (node) => node.id === partnerHandle
      );

      return {
        ...spouseNode,
        depth:
          partnerNode?.depth !== undefined
            ? partnerNode.depth + SPOUSE_DEPTH_OFFSET
            : spouseNode.depth,
      };
    });

  return [
    ...filteredPersonNodes,
    ...spouseNodesToAdd,
    ...multiplePartnerNodes,
  ];
};