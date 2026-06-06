
export type FamilyTreeMode = "ancestors" | "descendants";

export interface FamilyTreeNodeData {
  label?: string;
  gender?: string;
  birthDate?: string;
  deathDate?: string;
  isSelected?: boolean;
}

export interface FamilyTreeNode {
  id: string;
  type?: "person" | "relationship";
  position: {
    x: number;
    y: number;
  };
  data: FamilyTreeNodeData;
}

export interface FamilyTreeEdge {
  id: string;
  source: string;
  target: string;
}

export interface FamilyPerson {
  handle: string;
  grampsId?: string;
  gender?: string;
  firstName?: string;
  surname?: string;
  displayName: string;
  birthDate?: string;
  deathDate?: string;
}
export interface FamilyTreeResponseNode {
  id: string;
  label: string;
  gender?: string;
  birthDate?: string;
  deathDate?: string;
  depth: number;
  noPartners:number
};
export interface FamilyTreeResponseEdge {
  source: string;
  target: string;
  relationshipType: string;
}
export interface FamilyTreeResponseFamily {
  id: string;
  fatherHandle?: string;
  motherHandle?: string;
  childHandles: string[];
}

export interface FamilyTreeResponse {
  selectedPerson: FamilyPerson;
  nodes: FamilyTreeResponseNode[];
  edges: FamilyTreeResponseEdge[];
  families?: FamilyTreeResponseFamily[];
}

export type HiddenSpouses = Record<string,string[]>;


