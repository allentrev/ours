import type { TreeResponseNode } from "../../types/familyTypes";

import type { LayoutContext } from "./layoutTypes";

import { getFamilyId } from "./utils";

export const buildDescendantWorkNodes = (
  context: LayoutContext,
  visibleWorkNodes: TreeResponseNode[]
): TreeResponseNode[] => {
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

  return [...filteredPersonNodes, ...multiplePartnerNodes];
};