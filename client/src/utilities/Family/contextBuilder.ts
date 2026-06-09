import type {
    TreeMode,
    TreeResponse,
    TreeResponseFamily,
} from "../../types/familyTypes";

import type {
    LayoutContext,
    MultiPartnerSpouseMapEntry,
} from "./layoutTypes";

import { getMultiPartnerSpouseMap } from "./spouseHelpers";

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
        visibleFamilies.filter(
            (family) =>
                family.fatherHandle ===
                    selectedPersonHandle ||
                family.motherHandle ===
                    selectedPersonHandle
        );

    // --------------------------------------------------
    // Multi-partner visibility
    // --------------------------------------------------
    const hiddenSpouseHandles: MultiPartnerSpouseMapEntry[] =
        getMultiPartnerSpouseMap(
            data,
            mode
        );

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
        initialNodes.filter((node) =>
            selectedPersonHiddenSpouseIds.includes(
                node.id
            )
        );

    const hiddenIds: string[] =
        hiddenSpouseHandles.flatMap((entry) =>
            Object.values(entry).flat()
        );

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