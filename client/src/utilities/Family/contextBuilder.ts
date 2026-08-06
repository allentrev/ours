import type {
    TreeMode,
    TreeResponse,
    TreeResponseFamily,
    TreeResponseNode,
} from "../../types/familyTypes";

import type {
    LayoutContext,
    MultiPartnerSpouseMapEntry,
} from "./layoutTypes";

import { getMultiPartnerSpouseMap } from "./spouseHelpers";

const compareFamiliesByRelationshipDate = (
  familyA: TreeResponseFamily,
  familyB: TreeResponseFamily
): number => {
  const dateA =
    familyA.relationshipDate?.value ??
    Number.MAX_SAFE_INTEGER;

  const dateB =
    familyB.relationshipDate?.value ??
    Number.MAX_SAFE_INTEGER;

  if (dateA !== dateB) {
    return dateA - dateB;
  }

  return familyA.id.localeCompare(
    familyB.id
  );
};

export const buildLayoutContext = (
    data: TreeResponse,
    mode: TreeMode
): LayoutContext | null => {
    const selectedPersonHandle =
        data.selectedPerson.handle;

    const selectedPersonNode =
        data.nodes.find(
            (node) => node.id === selectedPersonHandle
        );

    if (!selectedPersonNode) {
        return null;
    }

    const selectedNoPartners =
        selectedPersonNode.noPartners ?? 0;

    const useExpandedLayout =
        mode === "descendants" &&
        selectedNoPartners > 2;

    const initialNodes = [...data.nodes];

    const workNodeIds = new Set(
        data.nodes.map((node) => node.id)
    );

    // --------------------------------------------------
    // Visible families
    // --------------------------------------------------
    const visibleFamilies: TreeResponseFamily[] =
        data.families?.filter((family) => {
            if (
                !family.fatherHandle &&
                !family.motherHandle
            ) {
                return false;
            }

            const parentHandles = [
                family.fatherHandle,
                family.motherHandle,
            ].filter(Boolean) as string[];

            return parentHandles.some(
                (parentHandle) =>
                    workNodeIds.has(parentHandle)
            );
        }) ?? [];

    const selectedFamilies =
      visibleFamilies
        .filter(
          (family) =>
            family.fatherHandle ===
              selectedPersonHandle ||
            family.motherHandle ===
              selectedPersonHandle
        )
        .sort(
          compareFamiliesByRelationshipDate
        );

    // --------------------------------------------------
    // Multi-partner visibility
    // --------------------------------------------------
    const hiddenSpouseHandles: MultiPartnerSpouseMapEntry[] =
        getMultiPartnerSpouseMap(
            data,
            mode
        );
    //console.log("HiddenSpouseHandles:", hiddenSpouseHandles);
    
    const matchedEntry =
        hiddenSpouseHandles.find(
            (entry) =>
                selectedPersonHandle in entry
        );

    const selectedPersonHiddenSpouseIds:
        string[] = matchedEntry
        ? matchedEntry[selectedPersonHandle]
        : [];

    const hiddenSpouseNodes =
      selectedPersonHiddenSpouseIds
        .map((spouseId) =>
          initialNodes.find(
            (node) =>
              node.id === spouseId
          )
        )
        .filter(
          (
            node
          ): node is TreeResponseNode =>
            node !== undefined
        );

    const hiddenIds: string[] =
        hiddenSpouseHandles.flatMap((entry) =>
            Object.values(entry).flat()
        );

    //console.log("HiddenSpouseHandles:", hiddenSpouseHandles);
    //console.log("HiddenSpouseNodes:", hiddenSpouseNodes);
    //console.log("HiddenIds:", hiddenIds);
    return {
        data,
        mode,

        selectedPersonHandle,
        selectedPersonNode,
        selectedNoPartners,
        useExpandedLayout,

        visibleFamilies,
        selectedFamilies,

        hiddenSpouseHandles,
        selectedPersonHiddenSpouseIds,
        hiddenSpouseNodes,
        hiddenIds,

        initialNodes,
        workNodeIds,
    };
};