import type {
  Generation,
  GenerationContext,
  GenerationDisplayModel,
} from "../../../types/upgradeTypes";

/*
 * Return the X coordinate of a visible
 * person slot.
 */
const getPersonX = (
  generation: Generation,
  personHandle: string
): number | undefined =>
  generation.slots.find(
    (slot) =>
      slot.type === "person" &&
      slot.person?.id ===
        personHandle
  )?.x;

/*
 * Return the relationship slot for a family.
 */
const getRelationshipSlot = (
  generation: Generation,
  familyId: string
) =>
  generation.slots.find(
    (slot) =>
      slot.type ===
        "relationship" &&
      slot.family?.id ===
        familyId
  );

/*
 * In descendant mode the relationship/display
 * source lives in the same generation as the
 * family channel.
 *
 * In ancestor mode the family channel is owned
 * by the child generation, while its parents and
 * relationship node are one generation above.
 */
const getFamilySourceGeneration = (
  displayModel: GenerationDisplayModel,
  generation: Generation,
  generationContext: GenerationContext
): Generation | undefined => {
  if (
    generationContext.mode ===
    "descendants"
  ) {
    return generation;
  }

  return displayModel.generations.find(
    (item) =>
      item.depth ===
      generation.depth + 1
  );
};

/*
 * Expanded descendant Generation 0 has no
 * relationship nodes.
 *
 * Each family instead originates from the
 * spouse person node.
 */
const getExpandedRootSource = (
  generation: Generation,
  family: Generation["families"][number]["family"],
  selectedPersonHandle: string
): {
  sourceNodeId?: string;
  sourceX?: number;
} => {
  const spouseHandle =
    family.fatherHandle ===
    selectedPersonHandle
      ? family.motherHandle
      : family.motherHandle ===
          selectedPersonHandle
        ? family.fatherHandle
        : undefined;

  if (!spouseHandle) {
    return {};
  }

  return {
    sourceNodeId:
      spouseHandle,

    sourceX:
      getPersonX(
        generation,
        spouseHandle
      ),
  };
};

/*
 * Determine the React Flow source node and
 * source X coordinate for a normal family.
 *
 * Priority:
 *
 * 1. Relationship node
 * 2. Visible parent person
 */
const getNormalFamilySource = (
  sourceGeneration: Generation,
  familyId: string,
  parentHandles: string[]
): {
  sourceNodeId?: string;
  sourceX?: number;
} => {
  const relationshipSlot =
    getRelationshipSlot(
      sourceGeneration,
      familyId
    );

  if (relationshipSlot) {
    return {
      sourceNodeId:
        relationshipSlot.id,

      sourceX:
        relationshipSlot.x,
    };
  }

  /*
   * Single-parent family, or any family
   * without a visible relationship slot.
   */
  for (
    const parentHandle
    of parentHandles
  ) {
    const parentX =
      getPersonX(
        sourceGeneration,
        parentHandle
      );

    if (
      typeof parentX === "number"
    ) {
      return {
        sourceNodeId:
          parentHandle,

        sourceX:
          parentX,
      };
    }
  }

  return {};
};

/*
 * Determine the final geometry and source
 * node for every family channel.
 *
 * Slot X positions and channel Y positions
 * must already have been calculated.
 */
export const layoutGenerationChannels = (
  displayModel: GenerationDisplayModel,
  generationContext: GenerationContext
): GenerationDisplayModel => {
  const generations =
    displayModel.generations.map(
      (generation) => {
        /*
         * Children lie one generation away
         * according to traversal direction.
         */
        const childGeneration =
          generationContext.mode ===
          "ancestors"
            ? generation
            : displayModel.generations.find(
                (item) =>
                  item.depth ===
                  generation.depth + 1
              );

              const channels =
          generation.channels.map(
            (channel) => {
              const generationFamily =
                generation.families.find(
                  (item) =>
                    item.family.id ===
                    channel.familyId
                );

              if (!generationFamily) {
                return channel;
              }

              const {
                family,
                parentHandles,
                childHandles,
              } =
                generationFamily;

              /*
               * ------------------------------------------------
               * Determine channel source.
               * ------------------------------------------------
               */
              let sourceNodeId:
                string | undefined;

              let sourceX:
                number | undefined;

              if (
                generation.layoutType ===
                  "expanded-root" &&
                generationContext.mode ===
                  "descendants"
              ) {
                const source =
                  getExpandedRootSource(
                    generation,
                    family,
                    generationContext
                      .selectedPersonHandle
                  );

                sourceNodeId =
                  source.sourceNodeId;

                sourceX =
                  source.sourceX;
              } else {
                const sourceGeneration =
                  getFamilySourceGeneration(
                    displayModel,
                    generation,
                    generationContext
                  );

                if (sourceGeneration) {
                  const source =
                    getNormalFamilySource(
                      sourceGeneration,
                      family.id,
                      parentHandles
                    );

                  sourceNodeId =
                    source.sourceNodeId;

                  sourceX =
                    source.sourceX;
                }
              }

              /*
               * ------------------------------------------------
               * Determine visible child X positions.
               * ------------------------------------------------
               */
              const childXs =
                childGeneration
                  ? childHandles
                      .map(
                        (childHandle) =>
                          getPersonX(
                            childGeneration,
                            childHandle
                          )
                      )
                      .filter(
                        (
                          x
                        ): x is number =>
                          typeof x ===
                          "number"
                      )
                  : [];

              /*
               * A channel may legitimately have
               * no visible child at the edge of
               * the requested tree depth.
               */
              if (
                childXs.length === 0
              ) {
                return {
                  ...channel,
                  sourceNodeId,
                  sourceX,
                };
              }

              /*
               * The horizontal family channel
               * must cover both the children and
               * its incoming source position.
               */
              const horizontalXs = [
                ...childXs,
                ...(
                  typeof sourceX ===
                  "number"
                    ? [sourceX]
                    : []
                ),
              ];

              const startX =
                Math.min(
                  ...horizontalXs
                );

              const endX =
                Math.max(
                  ...horizontalXs
                );

              return {
                ...channel,

                sourceNodeId,
                sourceX,
                startX,
                endX,
              };
            }
          );

        return {
          ...generation,
          channels,
        };
      }
    );

  return {
    generations,
  };
};