
import type { Node } from "@xyflow/react";

export type TreeMode = "ancestors" | "descendants";

export interface TreeNodeData {
  label?: string;
  gender?: string;
  birthDate?: string;
  deathDate?: string;
  isSelected?: boolean;
}

export interface TreeNode {
  id: string;
  type?: "person" | "relationship";
  position: {
    x: number;
    y: number;
  };
  data: TreeNodeData;
}

export interface TreeEdge {
  id: string;
  source: string;
  target: string;
}

export interface TreePerson {
  handle: string;
  grampsId?: string;
  gender?: string;
  firstName?: string;
  surname?: string;
  displayName: string;
  birthDate?: string;
  deathDate?: string;
  birthPlaceHandle?: string;
  deathPlaceHandle?: string;
  primaryPhotoUrl?: string;
  noteHandles?: string[];
}
export interface TreeResponseNode {
  id: string;
  label: string;
  gender?: string;
  birthDate?: string;
  deathDate?: string;
  depth: number;
  noPartners:number
};
export interface TreeResponseEdge {
  source: string;
  target: string;
  relationshipType: string;
}
export interface TreeResponseFamily {
  id: string;
  fatherHandle?: string;
  motherHandle?: string;
  childHandles: string[];
}

export interface TreeResponse {
  selectedPerson: TreePerson;
  nodes: TreeResponseNode[];
  edges: TreeResponseEdge[];
  families?: TreeResponseFamily[];
}

export interface PersonRecord {
  handle: string;
  grampsId: string;
  gender: string;
  firstName?: string;
  surname?: string;
  displayName: string;
  birthDate?: string;
  deathDate?: string;
  birthPlaceHandle?: string;
  deathPlaceHandle?: string;
  primaryPhotoUrl?: string;
  noteHandles?: string[];
}

export interface PlaceRecord {
  handle: string;
  grampsId: string;
  type: string;
  line1?: string;
  line2?: string;
  urbanArea?: string;
  county?: string;
  country?: string[];
  code?: string;
  displayPlace: string;
  name: string;
  shortName: string;
  geocodeName?: string;
  latitude?: number;
  longitude?: number;
  noteHandles?: string[];
}

export interface NoteRecord {
  handle: string;
  grampsId: string;
  type?: string;
  text: string;
}

export interface NewNoteInput {
  text: string;
}

export interface FamilyRecord {
  handle: string;
  grampsId: string;
  fatherHandle?: string;
  motherHandle?: string;
  childHandles?: string[];
  relationshipType: string;
  relationshipDate?: string;
  relationshipPlaceHandle?: string;
  noteHandles?: string[];
}

export type NewPlaceKind = "country" | "county" | "urbanArea";

export type UrbanPlaceType = "Village" | "Town" | "City";

export interface CreateSimplePlaceRequest {
  kind: NewPlaceKind;
  name: string;
  placeType?: UrbanPlaceType;
  county?: string;
  country?: string;
}

export interface CreateSimplePlaceResponse {
  place: PlaceRecord;
  options: PlaceOptions;
}

export interface PlaceOption {
  handle: string;
  name: string;
}

export interface PlaceOptions {
  places: PlaceRecord[];
  urbanAreas: PlaceOption[];
  counties: PlaceOption[];
  countries: PlaceOption[];
}

//  -------------------------------- Relationship Diagram --------------------
//
export type ActorEventType =
  | "addChild"
  | "addPartner"
  | "addSibling"
  | "addFamily";

export type ActorNodeKind =
  | "selected"
  | "person"
  | "family"
  | "add";

export interface ActorPerson {
  handle: string;
  displayName: string;
}

export interface ActorFamily {
  handle: string;
  displayName: string;
}

export interface PersonActorData {
  selectedPerson: ActorPerson;
  children: ActorPerson[];
  siblings: ActorPerson[];
  partners: ActorPerson[];
  families: ActorFamily[];
}

export interface ActorNodeData
  extends Record<string, unknown> {
  label: string;
  kind: ActorNodeKind;

  personHandle?: string;
  eventType?: ActorEventType;

  onOpenPersonDetails: (personHandle: string) => void;

  onAddActor: (
    eventType: ActorEventType,
    personHandle: string
  ) => void;

  selectedPersonHandle: string;
}

export type ActorFlowNode = Node<
  ActorNodeData,
  "actor"
>;