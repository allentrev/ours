import type {
  TreeMode,
  TreeResponse,
  TreeResponseFamily,
  TreeResponseNode,
} from "../../types/familyTypes";

export type MultiPartnerSpouseMapEntry = Record<string, string[]>;

export type TwoPartnerResult = {
  visibleWorkNodes: TreeResponseNode[];
  visibleworkNodeIds: Set<string>;
};

export interface LayoutContext {
    data: TreeResponse;
    mode: TreeMode;

    selectedPersonHandle: string;
    selectedPersonNode: TreeResponseNode;
    selectedNoPartners: number;
    useExpandedLayout: boolean;

    visibleFamilies: TreeResponseFamily[];
    selectedFamilies: TreeResponseFamily[];

    hiddenSpouseHandles:
        MultiPartnerSpouseMapEntry[];

    selectedPersonHiddenSpouseIds:
        string[];

    hiddenSpouseNodes:
        TreeResponseNode[];

    hiddenIds: string[];

    initialNodes: TreeResponseNode[];

    workNodeIds: Set<string>;
}