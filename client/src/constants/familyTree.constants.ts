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

export const ANCESTOR_LEVEL_HEIGHT = 320;
export const DESCENDANT_LEVEL_HEIGHT = 320;

export const urbanPlaceTypes: UrbanPlaceType[] = [
  "Village",
  "Town",
  "City",
];

//  --------------------------------NEW CONSTANTS FOR GENERATION LAYOUT--------------------------------
//
// 
export const SLOT_WIDTH = 220;
export const SLOT_HEIGHT = 120;
export const SLOT_GAP = 60;
export const PERSON_NODE_HEIGHT_ADJUSTMENT = 4;

export const RELATIONSHIP_SLOT_WIDTH = 24;
export const RELATIONSHIP_SLOT_HEIGHT = 24;

/*
 * Clear space between the bottom of the
 * generation slots and the first family channel.
 */
export const CHANNEL_TOP_MARGIN = 40;

/*
 * Vertical distance between family channels.
 */
export const CHANNEL_SPACING = 30;

/*
 * Clear space between the final family channel
 * and the next generation of slots.
 */
export const CHANNEL_BOTTOM_MARGIN = 50;

 /*
 * Additional generation separation when no
 * family channels exist.
 */
export const EMPTY_GENERATION_GAP = 80;

