import {
  PersonModel,
} from "../models/Family/person.model.js";

import {
  FamilyModel,
} from "../models/Family/family.model.js";

import {
  FamilyChildRelationshipModel,
} from "../models/Family/familyChildRelationship.model.js";

import type {
  ConnectionPathStep,
  ConnectionPersonSummary,
  ConnectionPartnerSummary,
  ConnectionPersonContext,
  PersonConnectionResponse,
  FamilyRecord,
  FamilyChildRelationshipRecord,
} from "../types/family.types.js";

/* -------------------------------------------------------------------------- */
/* Internal types                                                             */
/* -------------------------------------------------------------------------- */

interface GraphConnection {
  toHandle: string;

  type:
    | "parent"
    | "child"
    | "partner";

  familyHandle?: string;
}

interface QueueItem {
  handle: string;
  steps: ConnectionPathStep[];
}

interface PartnerFamilyReference {
  partnerHandle: string;
  familyHandle: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const addGraphConnection = (
  graph: Map<
    string,
    GraphConnection[]
  >,
  fromHandle: string,
  connection: GraphConnection
) => {
  const existing =
    graph.get(
      fromHandle
    ) ?? [];

  const duplicate =
    existing.some(
      (item) =>
        item.toHandle ===
          connection.toHandle &&
        item.type ===
          connection.type &&
        item.familyHandle ===
          connection.familyHandle
    );

  if (!duplicate) {
    existing.push(
      connection
    );
  }

  graph.set(
    fromHandle,
    existing
  );
};

/*
 * Build an undirected genealogy graph.
 *
 * Direction is retained in the connection
 * type:
 *
 * parent -> child = "child"
 * child  -> parent = "parent"
 * spouse -> spouse = "partner"
 */
const buildConnectionGraph = (
  families: FamilyRecord[],
  childRelationships:
    FamilyChildRelationshipRecord[]
): Map<
  string,
  GraphConnection[]
> => {
  const graph =
    new Map<
      string,
      GraphConnection[]
    >();

  const relationshipsByFamily =
    new Map<
      string,
      FamilyChildRelationshipRecord[]
    >();

  childRelationships.forEach(
    (relationship) => {
      const existing =
        relationshipsByFamily.get(
          relationship.familyHandle
        ) ?? [];

      existing.push(
        relationship
      );

      relationshipsByFamily.set(
        relationship.familyHandle,
        existing
      );
    }
  );

  families.forEach(
    (family) => {
      const fatherHandle =
        family.fatherHandle;

      const motherHandle =
        family.motherHandle;

      /*
       * Partner connection.
       */
      if (
        fatherHandle &&
        motherHandle
      ) {
        addGraphConnection(
          graph,
          fatherHandle,
          {
            toHandle:
              motherHandle,

            type:
              "partner",

            familyHandle:
              family.handle,
          }
        );

        addGraphConnection(
          graph,
          motherHandle,
          {
            toHandle:
              fatherHandle,

            type:
              "partner",

            familyHandle:
              family.handle,
          }
        );
      }

      /*
       * Parent / child connections.
       *
       * Use FamilyChildRelationship records
       * rather than family.childHandles so
       * this remains consistent with the
       * current genealogy model.
       */
      const familyChildRelationships =
        relationshipsByFamily.get(
          family.handle
        ) ?? [];

      familyChildRelationships.forEach(
        (
          childRelationship
        ) => {
          const childHandle =
            childRelationship
              .childHandle;

          const parentHandles = [
            fatherHandle,
            motherHandle,
          ].filter(
            (
              handle
            ): handle is string =>
              Boolean(
                handle
              )
          );

          parentHandles.forEach(
            (parentHandle) => {
              /*
               * Parent -> child
               */
              addGraphConnection(
                graph,
                parentHandle,
                {
                  toHandle:
                    childHandle,

                  type:
                    "child",

                  familyHandle:
                    family.handle,
                }
              );

              /*
               * Child -> parent
               */
              addGraphConnection(
                graph,
                childHandle,
                {
                  toHandle:
                    parentHandle,

                  type:
                    "parent",

                  familyHandle:
                    family.handle,
                }
              );
            }
          );
        }
      );
    }
  );

  return graph;
};

/*
 * Build partner context for people appearing
 * directly on the discovered connection path.
 *
 * These partners are contextual information.
 * They do not alter the connection path itself.
 */
const buildPersonContexts = async (
  people: ConnectionPersonSummary[],
  families: FamilyRecord[]
): Promise<ConnectionPersonContext[]> => {
  const pathHandleSet =
    new Set(
      people.map(
        (person) =>
          person.handle
      )
    );

  /*
   * For each path person, retain every family
   * in which they have a partner.
   */
  const partnerFamilyMap =
    new Map<
      string,
      PartnerFamilyReference[]
    >();

  families.forEach(
    (family) => {
      const fatherHandle =
        family.fatherHandle;

      const motherHandle =
        family.motherHandle;

      /*
       * A partner relationship requires
       * both people to be present.
       */
      if (
        !fatherHandle ||
        !motherHandle
      ) {
        return;
      }

      if (
        pathHandleSet.has(
          fatherHandle
        )
      ) {
        const existing =
          partnerFamilyMap.get(
            fatherHandle
          ) ?? [];

        existing.push({
          partnerHandle:
            motherHandle,

          familyHandle:
            family.handle,
        });

        partnerFamilyMap.set(
          fatherHandle,
          existing
        );
      }

      if (
        pathHandleSet.has(
          motherHandle
        )
      ) {
        const existing =
          partnerFamilyMap.get(
            motherHandle
          ) ?? [];

        existing.push({
          partnerHandle:
            fatherHandle,

          familyHandle:
            family.handle,
        });

        partnerFamilyMap.set(
          motherHandle,
          existing
        );
      }
    }
  );

  /*
   * Collect the unique partner people that
   * need to be loaded.
   */
  const partnerHandles = [
    ...new Set(
      [
        ...partnerFamilyMap.values(),
      ]
        .flat()
        .map(
          (item) =>
            item.partnerHandle
        )
    ),
  ];

  /*
   * It is quite valid for none of the path
   * people to have a recorded partner.
   */
  if (
    partnerHandles.length ===
    0
  ) {
    return people.map(
      (person) => ({
        person,
        partners: [],
      })
    );
  }

  const partnerPeople =
    await PersonModel.find({
      handle: {
        $in:
          partnerHandles,
      },
    })
      .select(
        "handle displayName"
      )
      .lean();

  const partnerPeopleByHandle =
    new Map<
      string,
      ConnectionPersonSummary
    >(
      partnerPeople.map(
        (person) => [
          person.handle,
          {
            handle:
              person.handle,

            displayName:
              person.displayName,
          },
        ]
      )
    );

  /*
   * Preserve the order of the people on
   * the actual connection path.
   */
  return people.map(
    (person) => {
      const partnerReferences =
        partnerFamilyMap.get(
          person.handle
        ) ?? [];

      const partners:
        ConnectionPartnerSummary[] =
        partnerReferences
          .map(
            (
              partnerReference
            ):
              | ConnectionPartnerSummary
              | undefined => {
              const partner =
                partnerPeopleByHandle.get(
                  partnerReference
                    .partnerHandle
                );

              if (!partner) {
                return undefined;
              }

              return {
                handle:
                  partner.handle,

                displayName:
                  partner.displayName,

                familyHandle:
                  partnerReference
                    .familyHandle,
              };
            }
          )
          .filter(
            (
              partner
            ): partner is
              ConnectionPartnerSummary =>
              Boolean(
                partner
              )
          );

      return {
        person,
        partners,
      };
    }
  );
};

/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

export const findPersonConnection = async (
  fromId: string,
  toId: string
): Promise<PersonConnectionResponse> => {
  /*
   * Validate the two people first.
   */
  const [
    fromPersonRecord,
    toPersonRecord,
  ] =
    await Promise.all([
      PersonModel.findOne({
        handle:
          fromId,
      })
        .select(
          "handle displayName"
        )
        .lean(),

      PersonModel.findOne({
        handle:
          toId,
      })
        .select(
          "handle displayName"
        )
        .lean(),
    ]);

  if (!fromPersonRecord) {
    throw new Error(
      `From person not found: ${fromId}`
    );
  }

  if (!toPersonRecord) {
    throw new Error(
      `To person not found: ${toId}`
    );
  }

  const fromPerson:
    ConnectionPersonSummary = {
    handle:
      fromPersonRecord.handle,

    displayName:
      fromPersonRecord.displayName,
  };

  const toPerson:
    ConnectionPersonSummary = {
    handle:
      toPersonRecord.handle,

    displayName:
      toPersonRecord.displayName,
  };

  /*
   * Same person is a valid zero-step
   * connection.
   *
   * No partner context is required for this
   * special case at present.
   */
  if (
    fromId ===
    toId
  ) {
    return {
      found:
        true,

      fromPerson,
      toPerson,

      steps:
        [],

      people: [
        fromPerson,
      ],

      familyHandles:
        [],

      personContexts:
        [],
    };
  }

  /*
   * Load the genealogy relationships once.
   *
   * For the current size of the family
   * database this keeps the BFS simple and
   * avoids database queries for every node
   * visited.
   */
  const [
    families,
    childRelationships,
  ] =
    await Promise.all([
      FamilyModel.find({})
        .lean<
          FamilyRecord[]
        >(),

      FamilyChildRelationshipModel
        .find({})
        .lean<
          FamilyChildRelationshipRecord[]
        >(),
    ]);

  const graph =
    buildConnectionGraph(
      families,
      childRelationships
    );

  /*
   * Breadth-first search.
   */
  const queue:
    QueueItem[] = [
      {
        handle:
          fromId,

        steps:
          [],
      },
    ];

  const visited =
    new Set<string>([
      fromId,
    ]);

  let foundSteps:
    ConnectionPathStep[] |
    undefined;

  while (
    queue.length >
    0
  ) {
    const current =
      queue.shift();

    if (!current) {
      break;
    }

    const neighbours =
      graph.get(
        current.handle
      ) ?? [];

    for (
      const neighbour
      of neighbours
    ) {
      if (
        visited.has(
          neighbour.toHandle
        )
      ) {
        continue;
      }

      const step:
        ConnectionPathStep = {
        fromHandle:
          current.handle,

        toHandle:
          neighbour.toHandle,

        type:
          neighbour.type,

        familyHandle:
          neighbour.familyHandle,
      };

      const steps = [
        ...current.steps,
        step,
      ];

      if (
        neighbour.toHandle ===
        toId
      ) {
        foundSteps =
          steps;

        break;
      }

      visited.add(
        neighbour.toHandle
      );

      queue.push({
        handle:
          neighbour.toHandle,

        steps,
      });
    }

    if (
      foundSteps
    ) {
      break;
    }
  }

  /*
   * No connection found.
   */
  if (
    !foundSteps
  ) {
    return {
      found:
        false,

      fromPerson,
      toPerson,

      steps:
        [],

      people: [
        fromPerson,
        toPerson,
      ],

      familyHandles:
        [],

      personContexts:
        [],
    };
  }

  /*
   * Gather every person appearing on
   * the discovered path.
   */
  const pathHandles = [
    fromId,
    ...foundSteps.map(
      (step) =>
        step.toHandle
    ),
  ];

  const uniquePathHandles = [
    ...new Set(
      pathHandles
    ),
  ];

  const pathPeople =
    await PersonModel.find({
      handle: {
        $in:
          uniquePathHandles,
      },
    })
      .select(
        "handle displayName"
      )
      .lean();

  const peopleByHandle =
    new Map<
      string,
      ConnectionPersonSummary
    >(
      pathPeople.map(
        (person) => [
          person.handle,
          {
            handle:
              person.handle,

            displayName:
              person.displayName,
          },
        ]
      )
    );

  /*
   * Preserve path order.
   */
  const people:
    ConnectionPersonSummary[] =
    uniquePathHandles
      .map(
        (handle) =>
          peopleByHandle.get(
            handle
          )
      )
      .filter(
        (
          person
        ): person is
          ConnectionPersonSummary =>
          Boolean(
            person
          )
      );

  /*
   * Add partner context for the people that
   * actually appear on the connection path.
   *
   * This does not affect BFS or alter the
   * discovered connection.
   */
  const personContexts =
    await buildPersonContexts(
      people,
      families
    );

  /*
   * Families directly used by the connection
   * path itself.
   *
   * Partner-context families are deliberately
   * not added here because familyHandles
   * describes the connection path, not the
   * decorative context.
   */
  const familyHandles = [
    ...new Set(
      foundSteps
        .map(
          (step) =>
            step.familyHandle
        )
        .filter(
          (
            handle
          ): handle is string =>
            Boolean(
              handle
            )
        )
    ),
  ];

  return {
    found:
      true,

    fromPerson,
    toPerson,

    steps:
      foundSteps,

    people,

    familyHandles,

    personContexts,
  };
};