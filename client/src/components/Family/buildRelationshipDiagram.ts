// components/Family/relationships/buildRelationshipDiagram.ts

import type {
  Edge,
  XYPosition,
} from "@xyflow/react";

import type {
  PersonActorData,
  ActorEventType,
  ActorFlowNode,
  ActorNodeData,
} from "../../types/familyTypes";

type RelationshipEdgeType =
  | "straight"
  | "smoothstep"
  | "relationship";

interface BuildRelationshipDiagramOptions {
  data: PersonActorData;

  onOpenPersonDetails: (
    personHandle: string
  ) => void;

  onOpenFamilyDetails: (
    familyHandle: string
  ) => void;

  onSelectPerson: (
    personHandle: string
  ) => void;
  
  onAddActor: (
    eventType: ActorEventType,
    personHandle: string
  ) => void;
}

interface RelationshipDiagramResult {
  nodes: ActorFlowNode[];
  edges: Edge[];
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 52;

const HORIZONTAL_GAP = 30;
const VERTICAL_GAP = 28;

const CENTRE_X = 600;
const CENTRE_Y = 390;

const TOP_Y = 80;
const BOTTOM_Y = 700;

const COLUMN_SIZE = 3;

const LEFT_GROUP_RIGHT = 390;
const SIDE_GROUP_GAP = CENTRE_X - LEFT_GROUP_RIGHT;

const RIGHT_GROUP_LEFT = 
  CENTRE_X +
  NODE_WIDTH +
  SIDE_GROUP_GAP;

const createNodeData = (
  data: PersonActorData,
  options: BuildRelationshipDiagramOptions,
  values: Pick<
    ActorNodeData,
    | "label"
    | "kind"
    | "personHandle"
    | "familyHandle"
    | "eventType"
  >
): ActorNodeData => ({
  ...values,

  selectedPersonHandle:
    data.selectedPerson.handle,

  onOpenPersonDetails:
    options.onOpenPersonDetails,

  onOpenFamilyDetails:
    options.onOpenFamilyDetails,

  onSelectPerson:
    options.onSelectPerson,

  onAddActor:
    options.onAddActor,
});

const createActorNode = (
  id: string,
  position: XYPosition,
  data: ActorNodeData
): ActorFlowNode => ({
  id,
  type: "actor",
  position,
  data,
  draggable: false,
  selectable: false,
  connectable: false,
});

const createEdge = (
  id: string,
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string,
  type: RelationshipEdgeType = "smoothstep",
  data?: Record<string, unknown>
): Edge => ({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
  type,
  data,
  animated: false,
  selectable: false,
  focusable: false,
  style: {
    strokeWidth: 1.5,
  },
});

const getHorizontalPositions = (
  itemCount: number,
  y: number
): XYPosition[] => {
  const totalWidth =
    itemCount * NODE_WIDTH +
    Math.max(0, itemCount - 1) *
      HORIZONTAL_GAP;

  const startX =
    CENTRE_X +
    NODE_WIDTH / 2 -
    totalWidth / 2;

  return Array.from(
    { length: itemCount },
    (_, index) => ({
      x:
        startX +
        index *
          (NODE_WIDTH + HORIZONTAL_GAP),
      y,
    })
  );
};

const getLeftGridPositions = (
  itemCount: number
): XYPosition[] => {
  if (itemCount === 0) {
    return [];
  }

  const rowCount = Math.min(
    itemCount,
    COLUMN_SIZE
  );

  const columnCount = Math.ceil(
    itemCount / COLUMN_SIZE
  );

  const totalHeight =
    rowCount * NODE_HEIGHT +
    Math.max(0, rowCount - 1) *
      VERTICAL_GAP;

  const startY =
    CENTRE_Y +
    NODE_HEIGHT / 2 -
    totalHeight / 2;

  return Array.from(
    { length: itemCount },
    (_, index) => {
      const row =
        index % COLUMN_SIZE;

      const column = Math.floor(
        index / COLUMN_SIZE
      );

      /*
       * Column zero is visually the leftmost column.
       * Later columns extend towards the selected person.
       */
      const visualColumn =
        columnCount - 1 - column;

      return {
        x:
          LEFT_GROUP_RIGHT -
          NODE_WIDTH -
          visualColumn *
            (NODE_WIDTH + HORIZONTAL_GAP),

        y:
          startY +
          row *
            (NODE_HEIGHT + VERTICAL_GAP),
      };
    }
  );
};

const getRightGridPositions = (
  itemCount: number
): XYPosition[] => {
  if (itemCount === 0) {
    return [];
  }

  const rowCount = Math.min(
    itemCount,
    COLUMN_SIZE
  );

  const totalHeight =
    rowCount * NODE_HEIGHT +
    Math.max(0, rowCount - 1) *
      VERTICAL_GAP;

  const startY =
    CENTRE_Y +
    NODE_HEIGHT / 2 -
    totalHeight / 2;

  return Array.from(
    { length: itemCount },
    (_, index) => {
      const row =
        index % COLUMN_SIZE;

      const column = Math.floor(
        index / COLUMN_SIZE
      );

      return {
        x:
          RIGHT_GROUP_LEFT +
          column *
            (NODE_WIDTH + HORIZONTAL_GAP),

        y:
          startY +
          row *
            (NODE_HEIGHT + VERTICAL_GAP),
      };
    }
  );
};

export const buildRelationshipDiagram = (
  options: BuildRelationshipDiagramOptions
): RelationshipDiagramResult => {
  const { data } = options;

  const nodes: ActorFlowNode[] = [];
  const edges: Edge[] = [];

  const selectedNodeId = "selected-person";

  nodes.push(
    createActorNode(
      selectedNodeId,
      {
        x: CENTRE_X,
        y: CENTRE_Y,
      },
      createNodeData(data, options, {
        label: `${data.selectedPerson.displayName}\n${CENTRE_X},${CENTRE_Y}`,
        kind: "selected",
        personHandle:
          data.selectedPerson.handle,
      })
    )
  );
  /* -------------------- Families -------------------- */

  const familyItems = [
    ...data.families.map((family) => ({
      id: `family-${family.handle}`,
      label: family.displayName,
      kind: "family" as const,
      personHandle: undefined,
      familyHandle: family.handle,
      eventType: undefined,
    })),

    {
      id: "add-family",
      label: "Add Family",
      kind: "add" as const,
      personHandle: undefined,
      familyHandle: undefined,
      eventType:
        "addFamily" as ActorEventType,
    },
  ];

  const familyPositions =
    getHorizontalPositions(
      familyItems.length,
      TOP_Y
    );
  
  const familyEdgeType: RelationshipEdgeType =
    familyItems.length === 1
      ? "straight"
      : "smoothstep";

  familyItems.forEach((item, index) => {
    nodes.push(
      createActorNode(
        item.id,
        familyPositions[index],
        createNodeData(data, options, {
          label: `${item.label}\n${familyPositions[index].x},${familyPositions[index].y}`,
          kind: item.kind,
          personHandle: item.personHandle,
          familyHandle: item.familyHandle,
          eventType: item.eventType,
        })
      )
    );

    edges.push(
      createEdge(
        `edge-${selectedNodeId}-${item.id}`,
        selectedNodeId,
        item.id,
        "source-top",
        "target-bottom",
        familyEdgeType,
      )
    );
  });

  /* -------------------- Children -------------------- */

  const childItems = [
    ...data.children.map((child) => ({
      id: `child-${child.handle}`,
      label: child.displayName,
      kind: "person" as const,
      personHandle: child.handle,
      familyHandle: undefined,
      eventType: undefined,
    })),

    {
      id: "add-child",
      label: "Add Child",
      kind: "add" as const,
      personHandle: undefined,
      familyHandle: undefined,
      eventType:
        "addChild" as ActorEventType,
    },
  ];

  const childPositions =
    getHorizontalPositions(
      childItems.length,
      BOTTOM_Y
    );

  const childEdgeType: RelationshipEdgeType =
    childItems.length === 1
      ? "straight"
      : "smoothstep";

  childItems.forEach((item, index) => {
    nodes.push(
      createActorNode(
        item.id,
        childPositions[index],
        createNodeData(data, options, {
          label: `${item.label}\n${childPositions[index].x},${childPositions[index].y}`,
          kind: item.kind,
          personHandle: item.personHandle,
          familyHandle: item.familyHandle,
          eventType: item.eventType,
        })
      )
    );

    edges.push(
      createEdge(
        `edge-${selectedNodeId}-${item.id}`,
        selectedNodeId,
        item.id,
        "source-bottom",
        "target-top",
        childEdgeType,
      )
    );
  });

  /* -------------------- Siblings -------------------- */

  const siblingItems = [
    ...data.siblings.map((sibling) => ({
      id: `sibling-${sibling.handle}`,
      label: sibling.displayName,
      kind: "person" as const,
      personHandle: sibling.handle,
      familyHandle: undefined,
      eventType: undefined,
    })),

    {
      id: "add-sibling",
      label: "Add Sibling",
      kind: "add" as const,
      personHandle: undefined,
      familyHandle: undefined,
      eventType:
        "addSibling" as ActorEventType,
    },
  ];

  const siblingPositions =
    getLeftGridPositions(
      siblingItems.length
    );

  const siblingCentreY =
    siblingPositions.length > 0
      ? (
          Math.min(
            ...siblingPositions.map(
              (position) => position.y
            )
          ) +
          Math.max(
            ...siblingPositions.map(
              (position) =>
                position.y + NODE_HEIGHT
            )
          )
        ) / 2
      : CENTRE_Y + NODE_HEIGHT / 2;

  siblingItems.forEach((item, index) => {
    nodes.push(
      createActorNode(
        item.id,
        siblingPositions[index],
        createNodeData(data, options, {
          label: `${item.label}\n${siblingPositions[index].x},${siblingPositions[index].y}`,
          kind: item.kind,
          personHandle: item.personHandle,
          familyHandle: item.familyHandle,
          eventType: item.eventType,
        })
      )
    );

    edges.push(
      createEdge(
        `edge-${selectedNodeId}-${item.id}`,
        selectedNodeId,
        item.id,
        "source-left",
        "target-right",
        "relationship",
        {
          mergeY: siblingCentreY,
        }
      )
    );
  });

console.log("Sibling edges end", edges);
/* -------------------- Partners -------------------- */

  const partnerItems = [
    ...data.partners.map((partner) => ({
      id: `partner-${partner.handle}`,
      label: partner.displayName,
      kind: "person" as const,
      personHandle: partner.handle,
      familyHandle: undefined,
      eventType: undefined,
    })),

    {
      id: "add-partner",
      label: "Add Partner",
      kind: "add" as const,
      personHandle: undefined,
      familyHandle: undefined,
      eventType:
        "addPartner" as ActorEventType,
    },
  ];

  const partnerPositions =
    getRightGridPositions(
      partnerItems.length
    );

  const partnerCentreY =
    partnerPositions.length > 0
      ? (
          Math.min(
            ...partnerPositions.map(
              (position) => position.y
            )
          ) +
          Math.max(
            ...partnerPositions.map(
              (position) =>
                position.y + NODE_HEIGHT
            )
          )
        ) / 2
      : CENTRE_Y + NODE_HEIGHT / 2;

  partnerItems.forEach((item, index) => {
    nodes.push(
      createActorNode(
        item.id,
        partnerPositions[index],
        createNodeData(data, options, {
          label: `${item.label}\n${partnerPositions[index].x},${partnerPositions[index].y}`,
          kind: item.kind,
          personHandle: item.personHandle,
          familyHandle: item.familyHandle,
          eventType: item.eventType,
        })
      )
    );

    edges.push(
      createEdge(
        `edge-${selectedNodeId}-${item.id}`,
        selectedNodeId,
        item.id,
        "source-right",
        "target-left",
        "relationship",
        {
          mergeY: partnerCentreY,
        }
      )
    );
  });
  
  return {
    nodes,
    edges,
  };
};