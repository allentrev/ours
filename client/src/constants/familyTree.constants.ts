import type {
  UrbanPlaceType,
} from "../types/familyTypes";

export const NODE_WIDTH = 320;
export const LEVEL_HEIGHT = 320;        //That controls the vertical gap between parent/child generations in normal cases.
export const PERSON_CARD_WIDTH = 180;
export const RELATIONSHIP_NODE_SIZE = 20;
export const PERSON_CARD_HEIGHT = 150;
export const PARTNERSHIP_ROW_SPACING = 150;
export const CHILD_SECTION_GAP = 0;

export const urbanPlaceTypes: UrbanPlaceType[] = [
  "Village",
  "Town",
  "City",
];