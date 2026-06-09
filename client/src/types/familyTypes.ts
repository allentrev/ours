
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
