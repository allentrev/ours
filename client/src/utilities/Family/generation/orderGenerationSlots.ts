import type { TreeResponseFamily } from "@/types/familyTypes";
import type {
  DisplaySlot,
  Generation,
  GenerationContext,
  GenerationDisplayModel,
} from "../../../types/upgradeTypes";

/*
 * A temporary ordering block.
 *
 * The block itself is not part of the final
 * display model. It simply ensures related
 * display slots stay together while the
 * generation is being ordered.
 */
interface SlotBlock {
  id: string;
  slots: DisplaySlot[];
}

/*
 * Return the person slot for a genealogy
 * person handle.
 */
const getPersonSlot = (
  generationSlots: DisplaySlot[],
  personHandle: string
): DisplaySlot | undefined =>
  generationSlots.find(
    (slot) =>
      slot.type === "person" &&
      slot.person?.id === personHandle
  );

/*
 * Return the multiple-partner slot belonging
 * to a particular person, if one exists.
 */
const getMultiplePartnerSlot = (
  generationSlots: DisplaySlot[],
  personHandle: string
): DisplaySlot | undefined =>
  generationSlots.find(
    (slot) =>
      slot.type === "multiple-partner" &&
      slot.personHandle === personHandle
  );

/*
 * Build the display unit for one person.
 *
 * Normally:
 *
 *   Person
 *
 * For a person with collapsed additional
 * spouses:
 *
 *   Person | MultiplePartner
 */
const buildPersonUnit = (
  generationSlots: DisplaySlot[],
  personHandle: string
): DisplaySlot[] => {
  const personSlot =
    getPersonSlot(
      generationSlots,
      personHandle
    );

  if (!personSlot) {
    return [];
  }

  const unit: DisplaySlot[] = [
    personSlot,
  ];

  const multiplePartnerSlot =
    getMultiplePartnerSlot(
      generationSlots,
      personHandle
    );

  if (multiplePartnerSlot) {
    unit.push(
      multiplePartnerSlot
    );
  }

  return unit;
};

/*
 * Build the special ordering blocks for a
 * person who has exactly two spouses.
 *
 * Layout:
 *
 *   Spouse 1 | Person | Spouse 2
 *
 * Relationship slots are deliberately NOT
 * included in this block because they do not
 * consume horizontal layout space. Their
 * positions are derived later.
 */
const buildTwoSpouseBlocks = (
  generation: Generation,
  dataFamilies: TreeResponseFamily[]
): SlotBlock[] => {
  const blocks: SlotBlock[] = [];

  generation.slots
    .filter(
      (
        slot
      ): slot is DisplaySlot & {
        person: NonNullable<
          DisplaySlot["person"]
        >;
      } =>
        slot.type === "person" &&
        Boolean(slot.person)
    )
    .forEach(
      (personSlot) => {
        const person =
          personSlot.person;

        if (
          Number(
            person.noPartners ?? 0
          ) !== 2
        ) {
          return;
        }

        const personFamilies =
          dataFamilies
            .filter(
              (family) =>
                family.fatherHandle ===
                  person.id ||
                family.motherHandle ===
                  person.id
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
        
        const spouseSlots =
          personFamilies
            .map(
              (family) => {
                const spouseHandle =
                  family.fatherHandle ===
                    person.id
                      ? family.motherHandle
                      : family.motherHandle ===
                          person.id
                        ? family.fatherHandle
                        : undefined;

                if (!spouseHandle) {
                  return undefined;
                }

                return getPersonSlot(
                  generation.slots,
                  spouseHandle
                );
              }
            )
            .filter(
              (
                slot
              ): slot is DisplaySlot =>
                Boolean(slot)
            );

        /*
         * We only create this special block
         * when both spouses are visible as
         * normal person slots.
         */
        const uniqueSpouseSlots =
          spouseSlots.filter(
            (slot, index, array) =>
              array.findIndex(
                (item) =>
                  item.id === slot.id
              ) === index
          );

        if (
          uniqueSpouseSlots.length !==
          2
        ) {
          return;
        }

        blocks.push({
          id:
            `two-spouse-block-${person.id}`,

          slots: [
            uniqueSpouseSlots[0],
            personSlot,
            uniqueSpouseSlots[1],
          ],
        });
      }
    );

  return blocks;
};

/*
 * Return true when this family is already
 * represented by a two-spouse ordering block.
 */
const familyIsInTwoSpouseBlock = (
  generationFamily:
    Generation["families"][number],
  twoSpouseBlocks: SlotBlock[]
): boolean => {
  const fatherHandle =
    generationFamily.family
      .fatherHandle;

  const motherHandle =
    generationFamily.family
      .motherHandle;

  if (
    !fatherHandle ||
    !motherHandle
  ) {
    return false;
  }

  return twoSpouseBlocks.some(
    (block) => {
      const personHandles =
        new Set(
          block.slots
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

      return (
        personHandles.has(
          fatherHandle
        ) &&
        personHandles.has(
          motherHandle
        )
      );
    }
  );
};

const buildMultiplePartnerBlocks = (
  generation: Generation
): SlotBlock[] => {
  const blocks:
    SlotBlock[] = [];

  generation.slots
    .filter(
      (slot) =>
        slot.type ===
        "multiple-partner"
    )
    .forEach(
      (multiplePartnerSlot) => {
        const personHandle =
          multiplePartnerSlot.personHandle;

        const visibleSpouseHandle =
          multiplePartnerSlot.visibleSpouseHandle;

        if (
          !personHandle ||
          !visibleSpouseHandle
        ) {
          return;
        }

        const personSlot =
          getPersonSlot(
            generation.slots,
            personHandle
          );

        const visibleSpouseSlot =
          getPersonSlot(
            generation.slots,
            visibleSpouseHandle
          );

        if (
          !personSlot ||
          !visibleSpouseSlot
        ) {
          return;
        }

        blocks.push({
          id:
            `multiple-partner-block-${personHandle}`,

          slots: [
            multiplePartnerSlot,
            personSlot,
            visibleSpouseSlot,
          ],
        });
      }
    );

  return blocks;
};


/*
 * Build blocks for ordinary two-parent
 * families.
 *
 * Normal:
 *
 *   Person | Spouse
 *
 * Multiple-partner:
 *
 *   MultiplePartner | Person | Visible spouse
 *
 * Relationship slots remain separate and
 * will be positioned geometrically between
 * the appropriate people later.
 */
const buildFamilyBlocks = (
  generation: Generation,
  twoSpouseBlocks: SlotBlock[]
): SlotBlock[] => {
  const blocks: SlotBlock[] = [];

  generation.families.forEach(
    (generationFamily) => {
      const {
        family,
      } =
        generationFamily;

      /*
       * Families already represented by an
       * exactly-two-spouse block must not
       * create another independent block.
       */
      if (
        familyIsInTwoSpouseBlock(
          generationFamily,
          twoSpouseBlocks
        )
      ) {
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

      /*
       * Determine whether either parent owns
       * a MultiplePartner display slot.
       */
      const multiplePartnerSlot =
        generation.slots.find(
          (slot) =>
            slot.type ===
              "multiple-partner" &&
            (
              slot.personHandle ===
                fatherHandle ||
              slot.personHandle ===
                motherHandle
            )
        );

      /*
       * If this family belongs to a
       * multiple-partner person, only the
       * family identified by visibleFamilyId
       * is displayed as the normal visible
       * spouse relationship.
       */
      if (
        multiplePartnerSlot &&
        multiplePartnerSlot.visibleFamilyId !==
          family.id
      ) {
        return;
      }

      /*
       * Special multiple-partner block:
       *
       *   MultiplePartner | Person | Visible spouse
       */
      if (
        multiplePartnerSlot &&
        multiplePartnerSlot.visibleFamilyId ===
          family.id
      ) {
        const multiplePartnerPersonHandle =
          multiplePartnerSlot.personHandle;

        if (
          !multiplePartnerPersonHandle
        ) {
          return;
        }

        const personSlot =
          getPersonSlot(
            generation.slots,
            multiplePartnerPersonHandle
          );

        const visibleSpouseHandle =
          multiplePartnerPersonHandle ===
          fatherHandle
            ? motherHandle
            : fatherHandle;

        const visibleSpouseSlot =
          getPersonSlot(
            generation.slots,
            visibleSpouseHandle
          );

        if (
          !personSlot ||
          !visibleSpouseSlot
        ) {
          return;
        }

        blocks.push({
          id:
            `family-block-${family.id}`,

          slots: [
            multiplePartnerSlot,
            personSlot,
            visibleSpouseSlot,
          ],
        });

        return;
      }

      /*
       * Ordinary two-person family.
       *
       * Relationship slots remain separate
       * and are positioned geometrically later.
       */
      const fatherUnit =
        buildPersonUnit(
          generation.slots,
          fatherHandle
        );

      const motherUnit =
        buildPersonUnit(
          generation.slots,
          motherHandle
        );

      if (
        fatherUnit.length === 0 ||
        motherUnit.length === 0
      ) {
        return;
      }

      blocks.push({
        id:
          `family-block-${family.id}`,

        slots: [
          ...fatherUnit,
          ...motherUnit,
        ],
      });
    }
  );

  return blocks;
};

/*
 * Return a block containing a particular
 * person, if one exists.
 */
const getBlockForPerson = (
  blocks: SlotBlock[],
  personHandle: string
): SlotBlock | undefined =>
  blocks.find(
    (block) =>
      block.slots.some(
        (slot) =>
          slot.type === "person" &&
          slot.person?.id ===
            personHandle
      )
  );

/*
 * Add an entire block to the ordered output.
 */
const addBlock = (
  ordered: DisplaySlot[],
  usedSlotIds: Set<string>,
  block: SlotBlock
) => {
  block.slots.forEach(
    (slot) => {
      if (
        usedSlotIds.has(
          slot.id
        )
      ) {
        return;
      }

      ordered.push(
        slot
      );

      usedSlotIds.add(
        slot.id
      );
    }
  );
};

/*
 * Add a standalone person and their optional
 * multiple-partner slot.
 */
const addPersonUnit = (
  ordered: DisplaySlot[],
  usedSlotIds: Set<string>,
  generationSlots: DisplaySlot[],
  personHandle: string
) => {
  const personUnit =
    buildPersonUnit(
      generationSlots,
      personHandle
    );

  personUnit.forEach(
    (slot) => {
      if (
        usedSlotIds.has(
          slot.id
        )
      ) {
        return;
      }

      ordered.push(
        slot
      );

      usedSlotIds.add(
        slot.id
      );
    }
  );
};

const orderGeneration = (
  generation: Generation,
  familyChildGroups: string[][],
  generationContext: GenerationContext
): DisplaySlot[] => {
  const ordered:
    DisplaySlot[] = [];

  const usedSlotIds =
    new Set<string>();

  const multiplePartnerBlocks =
    buildMultiplePartnerBlocks(
      generation
    );
  /*
   * Exactly-two-spouse blocks have highest
   * ordering priority.
   */
  const twoSpouseBlocks =
    buildTwoSpouseBlocks(
      generation,
      generationContext.dataFamilies
    );

  /*
   * Build normal family blocks only after
   * the two-spouse cases have been identified.
   */
  const familyBlocks =
    buildFamilyBlocks(
      generation,
      twoSpouseBlocks
    );

  /*
   * First process people in sibling order.
   */
  familyChildGroups.forEach(
    (childHandles) => {
      childHandles.forEach(
        (childHandle) => {

          const multiplePartnerBlock =
            getBlockForPerson(
              multiplePartnerBlocks,
              childHandle
            );

          if (multiplePartnerBlock) {
            addBlock(
              ordered,
              usedSlotIds,
              multiplePartnerBlock
            );

            return;
          }

          /*
           * Two-spouse block takes precedence.
           */
          const twoSpouseBlock =
            getBlockForPerson(
              twoSpouseBlocks,
              childHandle
            );

          if (twoSpouseBlock) {
            addBlock(
              ordered,
              usedSlotIds,
              twoSpouseBlock
            );

            return;
          }

          /*
           * Otherwise use a normal family block.
           */
          const familyBlock =
            getBlockForPerson(
              familyBlocks,
              childHandle
            );

          if (familyBlock) {
            addBlock(
              ordered,
              usedSlotIds,
              familyBlock
            );

            return;
          }

          addPersonUnit(
            ordered,
            usedSlotIds,
            generation.slots,
            childHandle
          );
        }
      );
    }
  );

  multiplePartnerBlocks.forEach(
    (block) => {
      addBlock(
        ordered,
        usedSlotIds,
        block
      );
    }
  );
  /*
   * Add any remaining two-spouse blocks.
   */
  twoSpouseBlocks.forEach(
    (block) => {
      addBlock(
        ordered,
        usedSlotIds,
        block
      );
    }
  );

  /*
   * Add remaining normal family blocks.
   */
  familyBlocks.forEach(
    (block) => {
      addBlock(
        ordered,
        usedSlotIds,
        block
      );
    }
  );

  /*
   * Add any remaining standalone people.
   */
  generation.slots
    .filter(
      (slot) =>
        slot.type ===
          "person" &&
        Boolean(
          slot.person
        )
    )
    .forEach(
      (personSlot) => {
        const personHandle =
          personSlot.person?.id;

        if (!personHandle) {
          return;
        }

        addPersonUnit(
          ordered,
          usedSlotIds,
          generation.slots,
          personHandle
        );
      }
    );

  /*
   * Finally retain synthetic slots.
   *
   * Relationship slots will be positioned
   * later and do not consume horizontal space.
   */
  generation.slots.forEach(
    (slot) => {
      if (
        usedSlotIds.has(
          slot.id
        )
      ) {
        return;
      }

      ordered.push(
        slot
      );

      usedSlotIds.add(
        slot.id
      );
    }
  );

  return ordered;
};

export const orderGenerationSlots = (
  displayModel: GenerationDisplayModel,
  generationContext: GenerationContext
): GenerationDisplayModel => {
  const generations =
    displayModel.generations.map(
      (generation) => {
        /*
         * Expanded-root has its own ordering
         * and geometry rules.
         */
        if (
          generation.layoutType ===
          "expanded-root"
        ) {
          return generation;
        }

        const previousGeneration =
          displayModel.generations.find(
            (item) =>
              item.depth ===
              generation.depth - 1
          );

        const familyChildGroups =
          previousGeneration
            ? previousGeneration.families.map(
                (family) =>
                  family.childHandles
              )
            : [];

        /*
         * Generation 0 is also ordered.
         *
         * It simply has no sibling groups
         * inherited from a previous generation.
         */
        return {
          ...generation,

          slots:
            orderGeneration(
              generation,
              familyChildGroups,
              generationContext
            ),
        };
      }
    );

  return {
    generations,
  };
};