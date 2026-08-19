import type {
  TreeResponseFamily,
  TreeResponseNode,
} from "../../../types/familyTypes";

import type {
  DisplaySlot,
  Generation,
  GenerationContext,
  GenerationDisplayModel,
  GenerationFamily,
} from "../../../types/upgradeTypes";

interface MultiplePartnerResult {
  slots: DisplaySlot[];
  families: GenerationFamily[];
}

/*
 * Return the spouse of personHandle in a family.
 */
const getSpouseHandle = (
  family: TreeResponseFamily,
  personHandle: string
): string | undefined => {
  if (
    family.fatherHandle ===
    personHandle
  ) {
    return family.motherHandle;
  }

  if (
    family.motherHandle ===
    personHandle
  ) {
    return family.fatherHandle;
  }

  return undefined;
};

/*
 * Find all families in which this person
 * is one of the parents.
 */
const getPersonFamilies = (
  families: TreeResponseFamily[],
  personHandle: string
): TreeResponseFamily[] =>
  families.filter(
    (family) =>
      family.fatherHandle ===
        personHandle ||
      family.motherHandle ===
        personHandle
  );

/*
 * Return all unique spouse handles for a person.
 */
const getSpouseHandles = (
  families: TreeResponseFamily[],
  personHandle: string
): string[] => [
  ...new Set(
    getPersonFamilies(
      families,
      personHandle
    )
      .map(
        (family) =>
          getSpouseHandle(
            family,
            personHandle
          )
      )
      .filter(
        (
          handle
        ): handle is string =>
          Boolean(handle)
      )
  ),
];

/*
 * Determine which family remains visible for
 * a multiple-partner person.
 *
 * Prefer the family whose children occur in
 * the traversal-adjacent generation.
 */
const getVisibleFamily = (
  families: TreeResponseFamily[],
  traversalGenerationPersonIds: Set<string>
): TreeResponseFamily | undefined => {
  const traversalFamily =
    families.find(
      (family) =>
        family.childHandles.some(
          (childHandle) =>
            traversalGenerationPersonIds.has(
              childHandle
            )
        )
    );

  return (
    traversalFamily ??
    families[0]
  );
};

/*
 * Add relationship slots whenever both people
 * belonging to a family are visibly present
 * in this generation.
 */
const addRelationshipSlots = (
  slots: DisplaySlot[],
  families: TreeResponseFamily[]
): DisplaySlot[] => {
  const populatedSlots = [
    ...slots,
  ];

  const personIds =
    new Set(
      populatedSlots
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

  families.forEach(
    (family) => {
      const fatherHandle =
        family.fatherHandle;

      const motherHandle =
        family.motherHandle;

      if (
        !fatherHandle ||
        !motherHandle ||
        !personIds.has(
          fatherHandle
        ) ||
        !personIds.has(
          motherHandle
        )
      ) {
        return;
      }

      const relationshipSlotId =
        `relationship-${family.id}`;

      if (
        populatedSlots.some(
          (slot) =>
            slot.id ===
            relationshipSlotId
        )
      ) {
        return;
      }

      populatedSlots.push({
        id:
          relationshipSlotId,

        type:
          "relationship",

        family,

        x: 0,
      });
    }
  );

  return populatedSlots;
};

/*
 * Ancestor Generation 0 with more than
 * two partners.
 *
 * Display:
 *
 *   Person | MultiplePartner
 *
 * No individual spouse remains visible.
 * The MultiplePartner slot represents ALL
 * partners rather than all-but-one.
 */
const populateAncestorMultiPartnerRoot = (
  generation: Generation,
  generationContext: GenerationContext
): Generation => {
  const selectedPersonSlot =
    generation.slots.find(
      (
        slot
      ): slot is DisplaySlot & {
        person: TreeResponseNode;
      } =>
        slot.type === "person" &&
        slot.person?.id ===
          generationContext.selectedPersonHandle
    );

  if (!selectedPersonSlot) {
    return generation;
  }

  const spouseHandles =
    getSpouseHandles(
      generationContext.dataFamilies,
      selectedPersonSlot.person.id
    );

  /*
   * This special root rule only applies
   * when there are more than two partners.
   */
  if (
    spouseHandles.length <= 2
  ) {
    return generation;
  }

  const multiplePartnerSlot:
    DisplaySlot = {
      id:
        `multiple-partner-${selectedPersonSlot.person.id}`,

      type:
        "multiple-partner",

      personHandle:
        selectedPersonSlot.person.id,

      /*
       * Unlike the normal collapsed display,
       * every spouse belongs to this slot.
       */
      spouseHandles,

      x: 0,
    };

  return {
    ...generation,

    layoutType:
      "normal",

    /*
     * Deliberately discard the individual
     * spouse person slots at ancestor depth 0.
     */
    slots: [
      selectedPersonSlot,
      multiplePartnerSlot,
    ],
  };
};

/*
 * Descendant Generation 0 expanded layout.
 *
 * Keep the selected person and every spouse
 * as real person slots.
 *
 * No MultiplePartner slot is created.
 *
 * Geometry will later arrange the spouses
 * vertically to the right of the selected
 * person.
 */
const populateExpandedRoot = (
  generation: Generation,
): Generation => {
  const slots = [
    ...generation.slots,
  ];

  return {
    ...generation,

    layoutType:
      "expanded-root",

    slots,
  };
};

/*
 * Collapse excess spouses for people with
 * more than two partners in normal generations.
 *
 * One spouse remains visible.
 * All remaining spouses are represented by
 * one MultiplePartner slot.
 */
const addMultiplePartnerSlots = (
  generation: Generation,
  generationContext: GenerationContext,
  traversalGenerationPersonIds: Set<string>
): MultiplePartnerResult => {
  let slots = [
    ...generation.slots,
  ];

  let families =
    generation.families.map(
      (generationFamily) => ({
        ...generationFamily,
        isVisibleFamily: false,
      })
    );

  const generationPeople =
    slots.filter(
      (
        slot
      ): slot is DisplaySlot & {
        person: TreeResponseNode;
      } =>
        slot.type === "person" &&
        Boolean(slot.person)
    );

  generationPeople.forEach(
    (personSlot) => {
      const person =
        personSlot.person;

      if (
        Number(
          person.noPartners ?? 0
        ) <= 2
      ) {
        return;
      }

      const personFamilies =
        getPersonFamilies(
          generationContext.dataFamilies,
          person.id
        );

      const uniqueSpouseHandles =
        getSpouseHandles(
          generationContext.dataFamilies,
          person.id
        );

      if (
        uniqueSpouseHandles.length <= 2
      ) {
        return;
      }

      /*
       * Choose the one family that remains
       * visible as a normal two-parent family.
       */
      const visibleFamily =
        getVisibleFamily(
          personFamilies,
          traversalGenerationPersonIds
        );

      if (visibleFamily) {
        families =
          families.map(
            (generationFamily) => {
              const belongsToPerson =
                generationFamily.family
                  .fatherHandle ===
                  person.id ||
                generationFamily.family
                  .motherHandle ===
                  person.id;

              if (!belongsToPerson) {
                return generationFamily;
              }

              return {
                ...generationFamily,

                isVisibleFamily:
                  generationFamily.family.id ===
                  visibleFamily.id,
              };
            }
          );
      }

      const primarySpouseHandle =
        visibleFamily
          ? getSpouseHandle(
              visibleFamily,
              person.id
            )
          : undefined;

      /*
       * Every spouse except the primary spouse
       * is represented by the MultiplePartner
       * display slot.
       */
      const hiddenSpouseHandles =
        uniqueSpouseHandles.filter(
          (spouseHandle) =>
            spouseHandle !==
            primarySpouseHandle
        );

      if (
        hiddenSpouseHandles.length === 0
      ) {
        return;
      }

      /*
       * Remove hidden spouses from the
       * ordinary person slots.
       */
      slots =
        slots.filter(
          (slot) =>
            !(
              slot.type ===
                "person" &&
              slot.person &&
              hiddenSpouseHandles.includes(
                slot.person.id
              )
            )
        );

      const multiplePartnerSlotId =
        `multiple-partner-${person.id}`;

      if (
        !slots.some(
          (slot) =>
            slot.id ===
            multiplePartnerSlotId
        )
      ) {
        slots.push({
          id:
            multiplePartnerSlotId,

          type:
            "multiple-partner",

          personHandle:
            person.id,

          spouseHandles:
            hiddenSpouseHandles,

          visibleFamilyId:
            visibleFamily?.id,

          visibleSpouseHandle:
            primarySpouseHandle,

          x: 0,
        });
      }
    }
  );

  return {
    slots,
    families,
  };
};

/*
 * Adds the non-person display slots required
 * within each generation.
 *
 * This function decides WHAT is displayed.
 * It does not decide ordering or geometry.
 */
export const populateGenerationSlots = (
  displayModel: GenerationDisplayModel,
  generationContext: GenerationContext
): GenerationDisplayModel => {
  const generations: Generation[] =
    displayModel.generations.map(
      (generation) => {
        /*
         * ------------------------------------------------
         * Special root case 1:
         *
         * Ancestor tree with a selected person having
         * more than two partners.
         *
         * Display only:
         *
         *   Person | MultiplePartner
         * ------------------------------------------------
         */
        if (
          generation.depth === 0 &&
          generationContext.mode ===
            "ancestors"
        ) {
          const selectedPersonSlot =
            generation.slots.find(
              (slot) =>
                slot.type ===
                  "person" &&
                slot.person?.id ===
                  generationContext
                    .selectedPersonHandle
            );

          if (
            Number(
              selectedPersonSlot?.person
                ?.noPartners ?? 0
            ) > 2
          ) {
            return (
              populateAncestorMultiPartnerRoot(
                generation,
                generationContext
              )
            );
          }
        }

        /*
         * ------------------------------------------------
         * Special root case 2:
         *
         * Descendant expanded-root.
         *
         * Keep the selected person and all spouse
         * person slots. They will later be positioned
         * as:
         *
         *   Person   Spouse 1
         *            Spouse 2
         *            Spouse 3
         *            ...
         * ------------------------------------------------
         */
        const useExpandedRoot =
          generation.depth === 0 &&
          generationContext.mode ===
            "descendants" &&
          generationContext.useExpandedLayout;

        if (useExpandedRoot) {
          return populateExpandedRoot(
            generation,
          );
        }

        /*
         * Normal generation processing.
         */
        const traversalGenerationDepth =
          generationContext.mode ===
          "ancestors"
            ? generation.depth - 1
            : generation.depth + 1;

        const traversalGeneration =
          displayModel.generations.find(
            (item) =>
              item.depth ===
              traversalGenerationDepth
          );

        const traversalGenerationPersonIds =
          new Set(
            traversalGeneration?.slots
              .filter(
                (
                  slot
                ): slot is DisplaySlot & {
                  person: TreeResponseNode;
                } =>
                  slot.type ===
                    "person" &&
                  Boolean(
                    slot.person
                  )
              )
              .map(
                (slot) =>
                  slot.person.id
              ) ??
              []
          );

        /*
         * Apply normal multiple-partner
         * collapsing rules.
         */
        const multiplePartnerResult =
          addMultiplePartnerSlots(
            generation,
            generationContext,
            traversalGenerationPersonIds
          );

        let slots =
          multiplePartnerResult.slots;

        const families =
          multiplePartnerResult.families;

        /*
         * Relationship slots are based purely
         * on which two parents are visibly
         * present in this generation.
         */
        slots =
          addRelationshipSlots(
            slots,
            generationContext.dataFamilies
          );

        return {
          ...generation,

          layoutType:
            "normal",

          slots,

          families,
        };
      }
    );

  return {
    generations,
  };
};