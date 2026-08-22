import type {
  Edge,
  Node,
} from "@xyflow/react";

import type {
  ConnectionPathStep,
  PersonConnectionResponse,
} from "../../types/familyTypes";

const HORIZONTAL_GAP = 320;
const VERTICAL_GAP = 220;
const PARTNER_GAP = 260;

interface ConnectionDiagramPerson {
  handle: string;
  displayName: string;

  /*
   * Generation relative to the highest
   * person in the connection path.
   */
  generation: number;

  /*
   * Position within the ordered path.
   */
  pathIndex: number;
}

export interface ConnectionDiagram {
  nodes: Node[];
  edges: Edge[];
}
/* -------------------------------------------------------------------------- */
/* Helpers                                                               */
/* -------------------------------------------------------------------------- */
const buildPartnerContextNodes = (
  data: PersonConnectionResponse,
  pathNodes: Node[]
): Node[] => {
  const pathNodeByHandle =
    new Map(
      pathNodes.map(
        (node) => [
          node.id,
          node,
        ]
      )
    );

  const partnerNodes: Node[] = [];

  data.personContexts.forEach(
    (context) => {
      if (
        context.partners.length !==
        1
      ) {
        return;
      }

      const pathNode =
        pathNodeByHandle.get(
          context.person.handle
        );

      if (!pathNode) {
        return;
      }

      const partner =
        context.partners[0];

      /*
       * Avoid adding a duplicate if the
       * partner is already on the actual
       * connection path.
       */
      if (
        pathNodeByHandle.has(
          partner.handle
        )
      ) {
        return;
      }

      partnerNodes.push({
        id:
          `partner-${partner.handle}`,

        type:
          "person",

        position: {
          x:
            pathNode.position.x +
            PARTNER_GAP,

          y:
            pathNode.position.y,
        },

        data: {
          label:
            partner.displayName,

          shortId:
            partner.handle.slice(
              -4
            ),

          personHandle:
            partner.handle,

          isSelected:
            false,

          isConnectionPartner:
            true,
        },
      });
    }
  );

  return partnerNodes;
};

const buildPartnerContextEdges = (
  data: PersonConnectionResponse,
  pathNodes: Node[],
  partnerNodes: Node[]
): Edge[] => {
  const pathNodeByHandle =
    new Map(
      pathNodes.map(
        (node) => [
          node.id,
          node,
        ]
      )
    );

  const partnerNodeByHandle =
    new Map(
      partnerNodes.map(
        (node) => [
          node.data
            .personHandle as string,
          node,
        ]
      )
    );

  const partnerEdges: Edge[] = [];

  data.personContexts.forEach(
    (context) => {
      if (
        context.partners.length !==
        1
      ) {
        return;
      }

      const partner =
        context.partners[0];

      const pathNode =
        pathNodeByHandle.get(
          context.person.handle
        );

      const partnerNode =
        partnerNodeByHandle.get(
          partner.handle
        );

      if (
        !pathNode ||
        !partnerNode
      ) {
        return;
      }

      partnerEdges.push({
        id:
          `connection-partner-${context.person.handle}-${partner.handle}`,

        source:
          pathNode.id,

        target:
          partnerNode.id,

        sourceHandle:
          "spouse-right-source",

        targetHandle:
          "spouse-left-target",

        type:
          "straight",

        data: {
          connectionType:
            "partner-context",

          familyHandle:
            partner.familyHandle,
        },
      });
    }
  );

  return partnerEdges;
};

const buildMultiplePartnerContextNodes = (
  data: PersonConnectionResponse,
  pathNodes: Node[]
): Node[] => {
  const pathNodeByHandle =
    new Map(
      pathNodes.map(
        (node) => [
          node.id,
          node,
        ]
      )
    );

  const multiplePartnerNodes:
    Node[] = [];

  data.personContexts.forEach(
    (context) => {
      if (
        context.partners.length <=
        1
      ) {
        return;
      }

      const pathNode =
        pathNodeByHandle.get(
          context.person.handle
        );

      if (!pathNode) {
        return;
      }

      multiplePartnerNodes.push({
        id:
          `multiple-partner-${context.person.handle}`,

        type:
          "multiplePartner",

        position: {
          x:
            pathNode.position.x +
            PARTNER_GAP,

          y:
            pathNode.position.y,
        },

        data: {
          personHandle:
            context.person.handle,

          shortId:
            context.person.handle.slice(
              -4
            ),

          noPartners:
            context.partners.length,

          label:
            context.person.displayName,
        },
      });
    }
  );

  return multiplePartnerNodes;
};

const buildMultiplePartnerContextEdges = (
  data: PersonConnectionResponse,
  pathNodes: Node[],
  multiplePartnerNodes: Node[]
): Edge[] => {
  const pathNodeByHandle =
    new Map(
      pathNodes.map(
        (node) => [
          node.id,
          node,
        ]
      )
    );

  const multiplePartnerNodeByPerson =
    new Map(
      multiplePartnerNodes.map(
        (node) => [
          node.data
            .personHandle as string,
          node,
        ]
      )
    );

  const edges:
    Edge[] = [];

  data.personContexts.forEach(
    (context) => {
      if (
        context.partners.length <=
        1
      ) {
        return;
      }

      const pathNode =
        pathNodeByHandle.get(
          context.person.handle
        );

      const multiplePartnerNode =
        multiplePartnerNodeByPerson.get(
          context.person.handle
        );

      if (
        !pathNode ||
        !multiplePartnerNode
      ) {
        return;
      }

      edges.push({
        id:
          `connection-multiple-partner-${context.person.handle}`,

        source:
          pathNode.id,

        target:
          multiplePartnerNode.id,

        sourceHandle:
          "spouse-right-source",

        targetHandle:
          "spouse-left-target",

        type:
          "straight",

        data: {
          connectionType:
            "partner-context",
        },
      });
    }
  );

  return edges;
};

/* -------------------------------------------------------------------------- */
/* Path geometry                                                               */
/* -------------------------------------------------------------------------- */

const buildConnectionPeople = (
  data: PersonConnectionResponse
): ConnectionDiagramPerson[] => {
  const peopleByHandle =
    new Map(
      data.people.map(
        (person) => [
          person.handle,
          person,
        ]
      )
    );

  const result:
    ConnectionDiagramPerson[] = [];

  const fromPerson =
    peopleByHandle.get(
      data.fromPerson.handle
    );

  if (!fromPerson) {
    return [];
  }

  /*
   * Start at an arbitrary generation.
   *
   * Parent steps move upwards.
   * Child steps move downwards.
   * Partner steps remain at the same level.
   */
  let generation = 0;

  result.push({
    handle:
      fromPerson.handle,

    displayName:
      fromPerson.displayName,

    generation,

    pathIndex:
      0,
  });

  data.steps.forEach(
    (step, index) => {
      if (
        step.type ===
        "parent"
      ) {
        generation -= 1;
      } else if (
        step.type ===
        "child"
      ) {
        generation += 1;
      }

      const person =
        peopleByHandle.get(
          step.toHandle
        );

      if (!person) {
        return;
      }

      result.push({
        handle:
          person.handle,

        displayName:
          person.displayName,

        generation,

        pathIndex:
          index + 1,
      });
    }
  );

  /*
   * Normalise so the highest ancestor
   * is generation 0.
   */
  const minimumGeneration =
    Math.min(
      ...result.map(
        (person) =>
          person.generation
      )
    );

  return result.map(
    (person) => ({
      ...person,

      generation:
        person.generation -
        minimumGeneration,
    })
  );
};

/*
 * The apex is the highest person in the
 * connection path.
 *
 * For cousin-style paths this is normally
 * the common ancestor.
 */
const findApexIndex = (
  people: ConnectionDiagramPerson[]
): number => {
  if (
    people.length === 0
  ) {
    return 0;
  }

  let apexIndex = 0;
  let minimumGeneration =
    people[0].generation;

  people.forEach(
    (person, index) => {
      if (
        person.generation <
        minimumGeneration
      ) {
        minimumGeneration =
          person.generation;

        apexIndex =
          index;
      }
    }
  );

  return apexIndex;
};

/*
 * Direct ancestor/descendant paths stay
 * in one vertical column.
 *
 * Paths which rise to a common ancestor
 * and then descend split into left and
 * right branches.
 */
const getX = (
  person:
    ConnectionDiagramPerson,
  apexIndex: number,
  pathLength: number
): number => {
  const directPath =
    apexIndex === 0 ||
    apexIndex ===
      pathLength - 1;

  if (directPath) {
    return 0;
  }

  if (
    person.pathIndex <
    apexIndex
  ) {
    return (
      -HORIZONTAL_GAP
    );
  }

  if (
    person.pathIndex >
    apexIndex
  ) {
    return HORIZONTAL_GAP;
  }

  return 0;
};

/* -------------------------------------------------------------------------- */
/* Nodes                                                                       */
/* -------------------------------------------------------------------------- */

const buildNodes = (
  people:
    ConnectionDiagramPerson[],
  fromHandle: string,
  toHandle: string
): Node[] => {
  const apexIndex =
    findApexIndex(
      people
    );

  return people.map(
    (person) => ({
      id:
        person.handle,

      type:
        "person",

      position: {
        x:
          getX(
            person,
            apexIndex,
            people.length
          ),

        y:
          person.generation *
          VERTICAL_GAP,
      },

      data: {
        label:
          person.displayName,

        shortId:
          person.handle.slice(
            -4
          ),

        personHandle:
          person.handle,

        isConnectionStart:
          person.handle ===
          fromHandle,

        isConnectionEnd:
          person.handle ===
          toHandle,

        /*
         * Keep existing PersonNode behaviour
         * compatible for the starting person.
         */
        isSelected:
          person.handle ===
          fromHandle,
      },
    })
  );
};

/* -------------------------------------------------------------------------- */
/* Edges                                                                       */
/* -------------------------------------------------------------------------- */

/*
 * Draw parent-child edges in genealogy
 * direction regardless of which direction
 * the connection search travelled.
 *
 * parent
 *   |
 * child
 */
const buildEdge = (
  step:
    ConnectionPathStep,
  index: number,
  nodeXByHandle:
    Map<string, number>
): Edge => {
  if (
    step.type ===
    "parent"
  ) {
    return {
      id:
        `connection-${index}`,

      source:
        step.toHandle,

      target:
        step.fromHandle,

      sourceHandle:
        "bottom-source",

      targetHandle:
        "top-target",

      type:
        "straight",

      data: {
        connectionType:
          step.type,

        familyHandle:
          step.familyHandle,
      },
    };
  }

  if (
    step.type ===
    "child"
  ) {
    return {
      id:
        `connection-${index}`,

      source:
        step.fromHandle,

      target:
        step.toHandle,

      sourceHandle:
        "bottom-source",

      targetHandle:
        "top-target",

      type:
        "straight",

      data: {
        connectionType:
          step.type,

        familyHandle:
          step.familyHandle,
      },
    };
  }

  /*
   * Partner path step.
   *
   * This is only used when the partner is
   * genuinely part of the discovered path.
   */
  const fromX =
    nodeXByHandle.get(
      step.fromHandle
    ) ?? 0;

  const toX =
    nodeXByHandle.get(
      step.toHandle
    ) ?? 0;

  const targetIsRight =
    toX >= fromX;

  return {
    id:
      `connection-${index}`,

    source:
      step.fromHandle,

    target:
      step.toHandle,

    sourceHandle:
      targetIsRight
        ? "spouse-right-source"
        : "spouse-left-source",

    targetHandle:
      targetIsRight
        ? "spouse-left-target"
        : "spouse-right-target",

    type:
      "straight",

    data: {
      connectionType:
        step.type,

      familyHandle:
        step.familyHandle,
    },
  };
};

/* -------------------------------------------------------------------------- */
/* Public builder                                                              */
/* -------------------------------------------------------------------------- */

export const buildConnectionDiagram = (
  data: PersonConnectionResponse
): ConnectionDiagram => {
  if (
    !data.found
  ) {
    return {
      nodes: [],
      edges: [],
    };
  }

  const people =
    buildConnectionPeople(
      data
    );

  const pathNodes =
    buildNodes(
      people,
      data.fromPerson.handle,
      data.toPerson.handle
    );

  const nodeXByHandle =
    new Map(
      pathNodes.map(
        (node) => [
          node.id,
          node.position.x,
        ]
      )
    );

  const pathEdges =
    data.steps.map(
      (step, index) =>
        buildEdge(
          step,
          index,
          nodeXByHandle
        )
    );

  const partnerNodes =
    buildPartnerContextNodes(
      data,
      pathNodes
    );

  const partnerEdges =
    buildPartnerContextEdges(
      data,
      pathNodes,
      partnerNodes
    );

  const multiplePartnerNodes =
    buildMultiplePartnerContextNodes(
      data,
      pathNodes
    );

  const multiplePartnerEdges =
    buildMultiplePartnerContextEdges(
      data,
      pathNodes,
      multiplePartnerNodes
    );

  return {
    nodes: [
      ...pathNodes,
      ...partnerNodes,
      ...multiplePartnerNodes,
    ],

    edges: [
      ...pathEdges,
      ...partnerEdges,
      ...multiplePartnerEdges,
    ],
  };
};