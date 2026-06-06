export interface RawGrampsPerson {
  handle: string;
  grampsId?: string;
  gender?: string;
  firstName?: string;
  surname?: string;
  displayName: string;
  birthDate?: string;
  deathDate?: string;
}

export interface RawGrampsFamily {
  handle: string;
  grampsId?: string;
  fatherHandle?: string;
  motherHandle?: string;
  childHandles: string[];
}

export interface ParsedGrampsData {
  people: RawGrampsPerson[];
  families: RawGrampsFamily[];
}

export interface RawRelationship {
  fromHandle: string;
  toHandle: string;
  relationshipType: "parent" | "child" | "spouse";
}

export interface MappedFamilyData {
  people: RawGrampsPerson[];
  relationships: RawRelationship[];
  families: FamilyGroup[];
}

export interface FamilyTreeNode {
  id: string;
  label: string;
  gender?: string;
  birthDate?: string;
  deathDate?: string;
  depth: number;
  noPartners:number
}

export interface FamilyTreeEdge {
  source: string;
  target: string;
  relationshipType: "parent" | "child" | "spouse";
}

export interface FamilyTreeResponse {
  nodes: FamilyTreeNode[];
  edges: FamilyTreeEdge[];
  families?: FamilyGroup[];
}

export interface FamilyGroup {
  id: string;
  fatherHandle?: string;
  motherHandle?: string;
  childHandles: string[];
}