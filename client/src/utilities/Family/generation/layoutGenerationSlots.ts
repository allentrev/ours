import type {
  TreeResponseFamily,
} from "../../../types/familyTypes";

import type {
  DisplaySlot,
  GenerationContext,
  GenerationDisplayModel,
} from "../../../types/upgradeTypes";

import {
  SLOT_WIDTH,
  SLOT_HEIGHT,
  SLOT_GAP,
  RELATIONSHIP_SLOT_WIDTH,
  RELATIONSHIP_SLOT_HEIGHT,
} from "../../../constants/familyTree.constants";

/*
 * Return the horizontal centre of a normal
 * display slot.
 */
const getSlotCentreX = (
  slot: DisplaySlot
): number =>
  slot.x +
  SLOT_WIDTH / 2;

/*
 * Position relationship slots for a normal
 * horizontally arranged generation.
 */
const positionNormalRelationshipSlots = (
  generationSlots: DisplaySlot[],
  positionedPrimarySlots: DisplaySlot[]
): DisplaySlot[] => {
  const primarySlotById =
    new Map(
      positionedPrimarySlots.map(
        (slot) => [
          slot.person?.id ??
            slot.id,
          slot,
        ]
      )
    );

  return generationSlots
    .filter(
      (slot) =>
        slot.type ===
        "relationship"
    )
    .map(
      (slot) => {
        const family =
          slot.family;

        if (!family) {
          return slot;
        }

        const fatherSlot =
          family.fatherHandle
            ? primarySlotById.get(
                family.fatherHandle
              )
            : undefined;

        const motherSlot =
          family.motherHandle
            ? primarySlotById.get(
                family.motherHandle
              )
            : undefined;

        if (
          !fatherSlot ||
          !motherSlot
        ) {
          return slot;
        }

        const fatherCentreX =
          getSlotCentreX(
            fatherSlot
          );

        const motherCentreX =
          getSlotCentreX(
            motherSlot
          );

        const relationshipCentreX =
          (
            fatherCentreX +
            motherCentreX
          ) / 2;

        return {
          ...slot,

          x:
            relationshipCentreX -
            RELATIONSHIP_SLOT_WIDTH /
              2,

          yOffset:
            (
              SLOT_HEIGHT -
              RELATIONSHIP_SLOT_HEIGHT
            ) / 2,
        };
      }
    );
};

const getExpandedRootSpouseOrder = (
  generationSlots: DisplaySlot[],
  selectedPersonHandle: string,
  families: TreeResponseFamily[]
): DisplaySlot[] => {
  const spouseSlotByHandle =
    new Map(
      generationSlots
        .filter(
          (
            slot
          ): slot is DisplaySlot & {
            person: NonNullable<
              DisplaySlot["person"]
            >;
          } =>
          slot.type === "person" &&
          slot.person?.id !==
            selectedPersonHandle
        )
        .map(
          (slot) => [
            slot.person.id,
            slot,
          ])
    );

  const selectedFamilies =
    families
      .filter(
        (family) =>
          family.fatherHandle ===
            selectedPersonHandle ||
          family.motherHandle ===
            selectedPersonHandle
      )
      .sort(
        (familyA, familyB) => {
          const dateA =
            familyA.relationshipDate
              ?.value ??
            Number.MAX_SAFE_INTEGER;

          const dateB =
            familyB.relationshipDate
              ?.value ??
            Number.MAX_SAFE_INTEGER;

          if (dateA !== dateB) {
            return dateA - dateB;
          }

          return familyA.id.localeCompare(
            familyB.id
          );
        }
      );

  const orderedSpouses:
    DisplaySlot[] = [];

  const usedSpouseHandles =
    new Set<string>();

  selectedFamilies.forEach(
    (family) => {
      const spouseHandle =
        family.fatherHandle ===
        selectedPersonHandle
          ? family.motherHandle
          : family.fatherHandle;

      if (
        !spouseHandle ||
        usedSpouseHandles.has(
          spouseHandle
        )
      ) {
        return;
      }

      const spouseSlot =
        spouseSlotByHandle.get(
          spouseHandle
        );

      if (!spouseSlot) {
        return;
      }

      orderedSpouses.push(
        spouseSlot
      );

      usedSpouseHandles.add(
        spouseHandle
      );
    }
  );

  return orderedSpouses;
};

/*
 * Expanded descendant root:
 *
 *                Spouse 1
 *
 * Selected       Spouse 2
 *
 *                Spouse 3
 *
 *                Spouse 4
 *
 * The selected person is vertically centred
 * beside the spouse stack.
 */
const layoutExpandedRoot = (
  generationSlots: DisplaySlot[],
  selectedPersonHandle: string,
  families: TreeResponseFamily[]
): DisplaySlot[] => {
  const selectedPersonSlot =
    generationSlots.find(
      (slot) =>
        slot.type === "person" &&
        slot.person?.id ===
          selectedPersonHandle
    );

  if (!selectedPersonSlot) {
    return generationSlots;
  }

  const spouseSlots =
    getExpandedRootSpouseOrder(
      generationSlots,
      selectedPersonHandle,
      families
    );

  const verticalSpacing =
    SLOT_HEIGHT +
    SLOT_GAP;

  const selectedX =
    0;

  const spouseX =
    SLOT_WIDTH +
    SLOT_GAP;

  const spouseStackHeight =
    spouseSlots.length > 0
      ? SLOT_HEIGHT +
        (spouseSlots.length - 1) *
          verticalSpacing
      : SLOT_HEIGHT;

  const selectedYOffset =
    (
      spouseStackHeight -
      SLOT_HEIGHT
    ) / 2;

  const positionedSelected:
    DisplaySlot = {
      ...selectedPersonSlot,

      x:
        selectedX,

      yOffset:
        selectedYOffset,
    };

  const positionedSpouses =
    spouseSlots.map(
      (spouseSlot, index) => ({
        ...spouseSlot,

        x:
          spouseX,

        yOffset:
          index *
          verticalSpacing,
      })
    );

  return [
    positionedSelected,
    ...positionedSpouses,
  ];
};

/*
 * Assign final display-slot geometry.
 *
 * Normal generations use horizontal spacing.
 *
 * Expanded descendant Generation 0 uses a
 * selected-person column plus a vertical spouse
 * column.
 *
 * Relationship slots never consume normal
 * horizontal layout space.
 */
export const layoutGenerationSlots = (
  displayModel: GenerationDisplayModel,
  generationContext: GenerationContext
): GenerationDisplayModel => {
  const generations =
    displayModel.generations.map(
      (generation) => {
        /*
         * Expanded descendant Generation 0.
         */
        if (
          generation.layoutType ===
          "expanded-root"
        ) {
          return {
            ...generation,

            slots:
              layoutExpandedRoot(
                generation.slots,
                generationContext
                  .selectedPersonHandle,
                generationContext
                  .dataFamilies
              ),
          };
        }

        /*
         * Normal generation.
         *
         * Relationship slots do not participate
         * in ordinary horizontal spacing.
         */
        const primarySlots =
          generation.slots.filter(
            (slot) =>
              slot.type !==
              "relationship"
          );

        if (
          primarySlots.length === 0
        ) {
          return generation;
        }

        const spacing =
          SLOT_WIDTH +
          SLOT_GAP;

        const generationWidth =
          (primarySlots.length - 1) *
          spacing;

        const startX =
          -generationWidth / 2;

        const positionedPrimarySlots =
          primarySlots.map(
            (slot, index) => ({
              ...slot,

              x:
                startX +
                index *
                  spacing,

              yOffset:
                0,
            })
          );

        const positionedRelationshipSlots =
          positionNormalRelationshipSlots(
            generation.slots,
            positionedPrimarySlots
          );

        return {
          ...generation,

          slots: [
            ...positionedPrimarySlots,
            ...positionedRelationshipSlots,
          ],
        };
      }
    );

  return {
    generations,
  };
};