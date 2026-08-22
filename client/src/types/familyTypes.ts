import type {
  Edge,
  Node,
} from "@xyflow/react";

/* -------------------------------------------------------------------------- */
/* Genealogical dates                                                         */
/* -------------------------------------------------------------------------- */

export type GenealogicalDateType =
  | "exact"
  | "about"
  | "before"
  | "after";

export interface GenealogicalDate {
  text: string;
  value?: number;
  type: GenealogicalDateType;
}

/* -------------------------------------------------------------------------- */
/* Family tree                                                                */
/* -------------------------------------------------------------------------- */

export type TreeMode =
  | "ancestors"
  | "descendants";

export interface TreeNodeData {
  label?: string;
  gender?: string;

  birthDate?: GenealogicalDate;
  deathDate?: GenealogicalDate;

  isSelected?: boolean;
}

export interface TreeNode {
  id: string;

  type?:
    | "person"
    | "relationship";

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

  birthDate?: GenealogicalDate;
  deathDate?: GenealogicalDate;

  birthPlaceHandle?: string;
  deathPlaceHandle?: string;

  primaryPhotoUrl?: string;
  noteHandles?: string[];
}

export interface TreeResponseNode {
  id: string;
  label: string;
  gender?: string;

  birthDate?: GenealogicalDate;
  deathDate?: GenealogicalDate;

  depth: number;
  noPartners: number;
}

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

  relationshipDate?: GenealogicalDate;
}

export interface TreeResponse {
  selectedPerson: TreePerson;
  nodes: TreeResponseNode[];
  edges: TreeResponseEdge[];
  families?: TreeResponseFamily[];
}

/* -------------------------------------------------------------------------- */
/* Person                                                                     */
/* -------------------------------------------------------------------------- */

export interface PersonRecord {
  handle: string;
  grampsId: string;

  gender: string;
  firstName?: string;
  surname?: string;
  displayName: string;

  birthDate?: GenealogicalDate;
  deathDate?: GenealogicalDate;

  birthPlaceHandle?: string;
  deathPlaceHandle?: string;

  primaryPhotoUrl?: string;
  noteHandles?: string[];
}

/* -------------------------------------------------------------------------- */
/* Place                                                                      */
/* -------------------------------------------------------------------------- */

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

export interface NewPlaceKindMap {
  country: "country";
  county: "county";
  urbanArea: "urbanArea";
}

export type NewPlaceKind =
  keyof NewPlaceKindMap;

export type UrbanPlaceType =
  | "Village"
  | "Town"
  | "City";

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

/* -------------------------------------------------------------------------- */
/* Notes                                                                      */
/* -------------------------------------------------------------------------- */

export interface NoteRecord {
  handle: string;
  grampsId: string;
  type?: string;
  text: string;
}

export interface NewNoteInput {
  text: string;
}

/* -------------------------------------------------------------------------- */
/* Family                                                                     */
/* -------------------------------------------------------------------------- */

export interface FamilyRecord {
  handle: string;
  grampsId: string;

  fatherHandle?: string;
  motherHandle?: string;
  childHandles?: string[];

  relationshipType: string;
  relationshipDate?: GenealogicalDate;

  relationshipPlaceHandle?: string;
  noteHandles?: string[];
}

/* -------------------------------------------------------------------------- */
/* Relationship diagram                                                       */
/* -------------------------------------------------------------------------- */

export type PersonAddType =
  | "addChild"
  | "addPartner"
  | "addSibling";

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

  birthDate?: GenealogicalDate;
  deathDate?: GenealogicalDate;
}

export interface ActorFamily {
  handle: string;
  displayName: string;

  relationshipDate?: GenealogicalDate;
}

export interface ActorChildFamily {
  handle: string;
  displayName: string;

  fatherHandle?: string;
  motherHandle?: string;

  relationshipDate?: GenealogicalDate;
}

export interface PersonActorData {
  selectedPerson: ActorPerson;

  children: ActorPerson[];
  siblings: ActorPerson[];
  partners: ActorPerson[];

  /*
   * Families in which the selected person
   * is a child.
   */
  families: ActorFamily[];

  /*
   * Families in which the selected person
   * is a parent.
   */
  childFamilies: ActorChildFamily[];
}

export interface ActorNodeData
  extends Record<string, unknown> {
  label: string;
  kind: ActorNodeKind;

  personHandle?: string;
  familyHandle?: string;
  eventType?: ActorEventType;

  onOpenPersonDetails: (
    personHandle: string
  ) => void;

  onSelectPerson: (
    personHandle: string
  ) => void;

  onAddActor: (
    eventType: ActorEventType,
    personHandle: string
  ) => void;

  onOpenFamilyDetails: (
    familyHandle: string
  ) => void;

  selectedPersonHandle: string;
}

export type ActorFlowNode = Node<
  ActorNodeData,
  "actor"
>;

/* -------------------------------------------------------------------------- */
/* Related-person creation                                                    */
/* -------------------------------------------------------------------------- */

export interface CreateRelatedPersonRequest {
  sourcePersonHandle: string;
  relationshipType: PersonAddType;
  familyHandle?: string;
  person: Partial<PersonRecord>;
}

export interface CreateRelatedPersonResponse {
  person: PersonRecord;
}

/* -------------------------------------------------------------------------- */
/* Family details                                                             */
/* -------------------------------------------------------------------------- */

export interface PersonActor {
  handle: string;
  displayName: string;

  birthDate?: GenealogicalDate;
  deathDate?: GenealogicalDate;
}

export interface FamilyDetailsData {
  handle: string;
  grampsId?: string;

  father?: PersonActor;
  mother?: PersonActor;
  children: PersonActor[];

  relationshipType?: string;
  relationshipDate?: GenealogicalDate;

  relationshipPlaceHandle?: string;
  relationshipPlaceName?: string;

  notes: NoteRecord[];
}

/* -------------------------------------------------------------------------- */
/* Edges                                                             */
/* -------------------------------------------------------------------------- */
export type FamilyTreeEdgeRouteMode =
  | "vertical-channel"
  | "horizontal-first"
  | "generation-channel"
  | "generation-horizontal-first";

export interface FamilyTreeEdgeData
  extends Record<string, unknown> {
  channelOffset?: number;
  targetOffset?: number;
  routeMode?: FamilyTreeEdgeRouteMode;
}

export type FamilyTreeEdge =
  Edge<FamilyTreeEdgeData> & {
    /*
     * The underlying genealogy family
     * represented by this edge.
     */
    familyId: string;
  };


/* -------------------------------------------------------------------------- */
/* Connection Diagram                                                         */
/* -------------------------------------------------------------------------- */
export type ConnectionStepType =
  | "parent"
  | "child"
  | "partner";

export interface ConnectionPathStep {
  fromHandle: string;
  toHandle: string;
  type: ConnectionStepType;
  familyHandle?: string;
}

export interface ConnectionPersonSummary {
  handle: string;
  displayName: string;
}

export interface PersonConnectionResponse {
  found: boolean;

  fromPerson: ConnectionPersonSummary;
  toPerson: ConnectionPersonSummary;

  steps: ConnectionPathStep[];

  people: ConnectionPersonSummary[];

  familyHandles: string[];

  personContexts: ConnectionPersonContext[];
}
export interface ConnectionPartnerSummary {
  handle: string;
  displayName: string;
  familyHandle: string;
}

export interface ConnectionPersonContext {
  person: ConnectionPersonSummary;
  partners: ConnectionPartnerSummary[];
}