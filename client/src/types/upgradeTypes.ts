import type {
  TreeMode,
  TreeResponseFamily,
  TreeResponseNode,
} from "./familyTypes";

export type GenerationLayoutType =
  | "normal"
  | "expanded-root";

export type DisplaySlotType =
  | "person"
  | "relationship"
  | "multiple-partner";

export interface DisplaySlot {
  id: string;

  type: DisplaySlotType;

  /*
   * Backing person data where this slot
   * represents a person.
   */
  person?: TreeResponseNode;

  /*
   * Backing family data where this slot
   * represents a relationship/family display.
   */
  family?: TreeResponseFamily;

  /*
   * Person this synthetic slot belongs to.
   *
   * Primarily used by multiple-partner slots.
   */
  personHandle?: string;
  /*
   * For a multiple-partner slot, identifies
   * the one family whose spouse remains
   * visibly connected to the person.
   */
  visibleFamilyId?: string;
  visibleSpouseHandle?: string;
  /*
   * Spouses represented by a multiple-partner slot.
   */
  spouseHandles?: string[];

  /*
   * Final X coordinate.
   * Y belongs to the generation.
   */
  x: number;
    /*
   * Vertical adjustment relative to
   * the generation Y coordinate.
   */
  yOffset?: number;
}

export interface GenerationFamily {
  family: TreeResponseFamily;

  parentHandles: string[];
  childHandles: string[];
  /*
   * For a person with multiple spouses,
   * this marks the one family shown as the
   * normal person-spouse relationship.
   */
  isVisibleFamily?: boolean;
}

export interface GenerationChannel {
  familyId: string;

  /*
   * Order of the channel within this generation.
   */
  index: number;
    /*
   * React Flow node from which this
   * family channel originates.
   */
  sourceNodeId?: string;

  y?: number;
    /*
   * X coordinate from which the family
   * connection enters this channel.
   */
  sourceX?: number;

  /*
   * Horizontal span of the shared family channel.
   * Filled during geometry layout.
   */
  startX?: number;
  endX?: number;
}

export interface Generation {
  depth: number;

  layoutType:
    GenerationLayoutType;

  /*
   * Absolute Y coordinate shared by
   * the slots in this generation.
   */
  y: number;

  slots:
    DisplaySlot[];

  families:
    GenerationFamily[];

  channels:
    GenerationChannel[];

  nextGenerationY?: number;
}

export interface GenerationContext {
  dataNodes: TreeResponseNode[];
  dataFamilies: TreeResponseFamily[];

  mode: TreeMode;

  selectedPersonHandle: string;

  useExpandedLayout: boolean;
}

export interface GenerationDisplayModel {
  generations:
    Generation[];
}