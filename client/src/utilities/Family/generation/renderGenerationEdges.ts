import type {
  FamilyTreeEdge,
} from "../../../types/familyTypes";

import type {
  Generation,
  GenerationContext,
  GenerationDisplayModel,
} from "../../../types/upgradeTypes";

const getPersonSlot = (
  generation: Generation,
  personHandle: string
) =>
  generation.slots.find(
    (slot) =>
      slot.type === "person" &&
      slot.person?.id ===
        personHandle
  );

/*
 * Add the two horizontal edges belonging
 * to each visible relationship node.
 *
 * Geometry determines left/right orientation,
 * so this also works for:
 *
 *   Person | Spouse
 *
 *   Spouse 1 | Person | Spouse 2
 */
const renderNormalRelationshipEdges = (
  generation: Generation
): FamilyTreeEdge[] => {
  const edges:
    FamilyTreeEdge[] = [];

  generation.slots
    .filter(
      (slot) =>
        slot.type ===
          "relationship" &&
        Boolean(slot.family)
    )
    .forEach(
      (relationshipSlot) => {
        const family =
          relationshipSlot.family;

        if (!family) {
          return;
        }

        const fatherHandle =
          family.fatherHandle;

        const motherHandle =
          family.motherHandle;

        if (
          !fatherHandle ||
          !motherHandle
        ) {
          return;
        }

        const fatherSlot =
          getPersonSlot(
            generation,
            fatherHandle
          );

        const motherSlot =
          getPersonSlot(
            generation,
            motherHandle
          );

        if (
          !fatherSlot ||
          !motherSlot
        ) {
          return;
        }

        /*
         * Work from the actual display geometry,
         * not father/mother semantics.
         */
        const leftPersonSlot =
          fatherSlot.x <
          motherSlot.x
            ? fatherSlot
            : motherSlot;

        const rightPersonSlot =
          fatherSlot.x <
          motherSlot.x
            ? motherSlot
            : fatherSlot;

        /*
         * Left person -> Relationship
         */
        edges.push({
          id:
            `relationship-left-${family.id}`,

          source:
            relationshipSlot.id,

          target:
            leftPersonSlot.id,

          sourceHandle:
            "left-source",

          targetHandle:
            "spouse-right-target",

          type:
            "relationship",

          familyId:
            family.id,
        });
        /*
         * Relationship -> Right person
         */
        edges.push({
          id:
            `relationship-right-${family.id}`,

          source:
            relationshipSlot.id,

          target:
            rightPersonSlot.id,

          sourceHandle:
            "right-source",

          targetHandle:
            "spouse-left-target",

          type:
            "relationship",

          familyId:
            family.id,
        });
      }
    );

  return edges;
};

/*
 * Expanded descendant root has no relationship
 * nodes.
 *
 * Connect the selected person directly to every
 * visible spouse.
 */
const renderExpandedRootRelationshipEdges = (
  generation: Generation,
  generationContext: GenerationContext
): FamilyTreeEdge[] => {
  if (
    generation.layoutType !==
      "expanded-root" ||
    generationContext.mode !==
      "descendants"
  ) {
    return [];
  }

  const selectedPersonHandle =
    generationContext
      .selectedPersonHandle;

  const selectedPersonSlot =
    getPersonSlot(
      generation,
      selectedPersonHandle
    );

  if (!selectedPersonSlot) {
    return [];
  }

  const visiblePersonIds =
    new Set(
      generation.slots
        .filter(
          (slot) =>
            slot.type === "person"
        )
        .map(
          (slot) =>
            slot.person?.id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    );

  const edges:
    FamilyTreeEdge[] = [];

  generationContext.dataFamilies
    .filter(
      (family) =>
        family.fatherHandle ===
          selectedPersonHandle ||
        family.motherHandle ===
          selectedPersonHandle
    )
    .forEach(
      (family) => {
        const spouseHandle =
          family.fatherHandle ===
          selectedPersonHandle
            ? family.motherHandle
            : family.fatherHandle;

        if (
          !spouseHandle ||
          !visiblePersonIds.has(
            spouseHandle
          )
        ) {
          return;
        }

        edges.push({
          id:
            `expanded-relationship-${family.id}`,

          source:
            selectedPersonSlot.id,

          target:
            spouseHandle,

          sourceHandle:
            "spouse-right-source",

          targetHandle:
            "spouse-left-target",

          type:
            "relationship",

          familyId:
            family.id,
        });
      }
    );

  return edges;
};

/*
 * Render React Flow family-child edges from
 * the completed generation display model.
 *
 * At this stage the display model has already
 * decided:
 *
 * - which node owns each family connection
 * - where the family channel is positioned
 * - the horizontal extent of that channel
 *
 * This function therefore does not infer
 * family structure. It simply converts the
 * display model into React Flow edges.
 */
export const renderGenerationEdges = (
  displayModel: GenerationDisplayModel,
  generationContext: GenerationContext
): FamilyTreeEdge[] => {
  const edges:
    FamilyTreeEdge[] = [];

  displayModel.generations.forEach(
    (generation) => {
      /*
      * Normal person/relationship/spouse
      * connections.
      */
      edges.push(
        ...renderNormalRelationshipEdges(
          generation
        )
      );

      /*
      * Expanded-root direct person/spouse
      * connections.
      */
      edges.push(
        ...renderExpandedRootRelationshipEdges(
          generation,
          generationContext
        )
      );
      /*
      * Existing family-child edge generation.
      */
      generation.channels.forEach(
        (channel) => {
          const generationFamily =
            generation.families.find(
              (item) =>
                item.family.id ===
                channel.familyId
            );

          if (!generationFamily) {
            return;
          }

          const {
            family,
            childHandles,
          } =
            generationFamily;

          /*
           * The channel layout stage has already
           * determined which visible React Flow
           * node owns this family connection.
           */
          const sourceNodeId =
            channel.sourceNodeId;

          if (!sourceNodeId) {
            return;
          }

          /*
           * Children are found in the traversal-
           * adjacent generation.
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

          if (!childGeneration) {
            return;
          }

          childHandles.forEach(
            (childHandle) => {
              const childSlot =
                childGeneration.slots.find(
                  (slot) =>
                    slot.type ===
                      "person" &&
                    slot.person?.id ===
                      childHandle
                );

              if (!childSlot) {
                return;
              }

              /*
              * Family-child edges always run from the
              * family source node to the child.
              *
              * In both ancestor and descendant views,
              * relationship nodes use their bottom handle.
              */
              const source =
                sourceNodeId;

              const target =
                childHandle;

              const sourceIsRelationship =
                sourceNodeId.startsWith(
                  "relationship-"
                );

              const isExpandedRootSource =
                generation.layoutType ===
                  "expanded-root" &&
                generationContext.mode ===
                  "descendants";

              const sourceHandle =
                sourceIsRelationship
                  ? "bottom"
                  : isExpandedRootSource
                    ? "spouse-right-source"
                    : undefined;

              edges.push({
                id:
                  `family-child-${family.id}-${childHandle}`,

                source,
                target,

                sourceHandle,

                type:
                  "familyChild",

                familyId:
                  family.id,

                data: {
                  familyId:
                    family.id,

                  routeMode:
                    isExpandedRootSource
                      ? "generation-horizontal-first"
                      : "generation-channel",

                  sourceX:
                    channel.sourceX,

                  channelY:
                    channel.y,

                  channelIndex:
                    channel.index,

                  startX:
                    channel.startX,

                  endX:
                    channel.endX,

                  mode:
                    generationContext.mode,
                },
              });
            }
          );
        }
      );
    }
  );

  return edges;
};