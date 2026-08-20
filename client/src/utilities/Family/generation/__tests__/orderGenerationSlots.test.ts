import {
  describe,
  expect,
  it,
} from "vitest";

import {
  orderGenerationSlots,
} from "../orderGenerationSlots";

import type {
  GenerationContext,
  GenerationDisplayModel,
} from "../../../../types/upgradeTypes";

describe(
  "orderGenerationSlots",
  () => {
    it(
      "orders a two-partner person between their spouses",
      () => {
        const displayModel:
          GenerationDisplayModel = {
          generations: [
            {
              depth: 0,
              layoutType: "normal",
              y: 0,

              slots: [
                {
                  id: "person",
                  type: "person",
                  person: {
                    id: "person",
                    label: "Person",
                    depth: 0,
                    noPartners: 2,
                  },
                  x: 0,
                },

                {
                  id: "spouse-1",
                  type: "person",
                  person: {
                    id: "spouse-1",
                    label: "Spouse 1",
                    depth: 0,
                    noPartners: 1,
                  },
                  x: 0,
                },

                {
                  id: "spouse-2",
                  type: "person",
                  person: {
                    id: "spouse-2",
                    label: "Spouse 2",
                    depth: 0,
                    noPartners: 1,
                  },
                  x: 0,
                },
              ],

              families: [
                {
                  family: {
                    id: "family-1",
                    fatherHandle: "person",
                    motherHandle: "spouse-1",
                    childHandles: [],
                    relationshipDate: {
                      value: 2000,
                      text: "2000",
                      type: "exact",
                    },
                  },

                  parentHandles: [
                    "person",
                    "spouse-1",
                  ],

                  childHandles: [],
                },

                {
                  family: {
                    id: "family-2",
                    fatherHandle: "person",
                    motherHandle: "spouse-2",
                    childHandles: [],
                    relationshipDate: {
                      value: 2010,
                      text: "2010",
                      type: "exact",
                    },
                  },

                  parentHandles: [
                    "person",
                    "spouse-2",
                  ],

                  childHandles: [],
                },
              ],

              channels: [],
            },
          ],
        };

        const context:
          GenerationContext = {
          dataNodes: [
            displayModel.generations[0]
              .slots[0].person!,
            displayModel.generations[0]
              .slots[1].person!,
            displayModel.generations[0]
              .slots[2].person!,
          ],

          dataFamilies:
            displayModel.generations[0]
              .families.map(
                (item) =>
                  item.family
              ),

          mode:
            "descendants",

          selectedPersonHandle:
            "person",

          useExpandedLayout:
            false,
        };

        const result =
          orderGenerationSlots(
            displayModel,
            context
          );

        const orderedIds =
          result.generations[0]
            .slots.map(
              (slot) =>
                slot.id
            );

        expect(
          orderedIds
        ).toEqual([
          "spouse-1",
          "person",
          "spouse-2",
        ]);
      }
    );

    it(
      "keeps an ordinary ancestor couple together when special partner blocks exist in the same generation",
      () => {
        const ordinaryPersonA = {
          id: "ordinary-a",
          label: "Ordinary A",
          depth: 3,
          noPartners: 1,
        };

        const ordinaryPersonB = {
          id: "ordinary-b",
          label: "Ordinary B",
          depth: 3,
          noPartners: 1,
        };

        const twoPartnerPerson = {
          id: "two-partner",
          label: "Two Partner Person",
          depth: 3,
          noPartners: 2,
        };

        const twoPartnerSpouse1 = {
          id: "two-spouse-1",
          label: "Two Spouse 1",
          depth: 3,
          noPartners: 1,
        };

        const twoPartnerSpouse2 = {
          id: "two-spouse-2",
          label: "Two Spouse 2",
          depth: 3,
          noPartners: 1,
        };

        const multiPartnerPerson = {
          id: "multi-person",
          label: "Multi Partner Person",
          depth: 3,
          noPartners: 3,
        };

        const visibleMultiSpouse = {
          id: "multi-visible-spouse",
          label: "Visible Multi Spouse",
          depth: 3,
          noPartners: 1,
        };

        const ordinaryFamily = {
          id: "ordinary-family",
          fatherHandle: "ordinary-a",
          motherHandle: "ordinary-b",
          childHandles: [
            "ordinary-child",
          ],
        };

        const twoFamily1 = {
          id: "two-family-1",
          fatherHandle: "two-partner",
          motherHandle: "two-spouse-1",
          childHandles: [
            "two-child",
          ],
          relationshipDate: {
            value: 1900,
            text: "1900",
            type: "exact" as const,
          },
        };

        const twoFamily2 = {
          id: "two-family-2",
          fatherHandle: "two-partner",
          motherHandle: "two-spouse-2",
          childHandles: [],
          relationshipDate: {
            value: 1910,
            text: "1910",
            type: "exact" as const,
          },
        };

        const multiFamily = {
          id: "multi-family",
          fatherHandle: "multi-person",
          motherHandle:
            "multi-visible-spouse",
          childHandles: [
            "multi-child",
          ],
        };

        const displayModel:
          GenerationDisplayModel = {
          generations: [
            /*
            * Previous generation.
            *
            * These families establish the branch
            * child groups used when ordering depth 3.
            */
            {
              depth: 2,
              layoutType: "normal",
              y: 0,

              slots: [],

              families: [
                {
                  family: {
                    id: "branch-ordinary",
                    childHandles: [
                      "ordinary-a",
                    ],
                  },
                  parentHandles: [],
                  childHandles: [
                    "ordinary-a",
                  ],
                },

                {
                  family: {
                    id: "branch-two",
                    childHandles: [
                      "two-partner",
                    ],
                  },
                  parentHandles: [],
                  childHandles: [
                    "two-partner",
                  ],
                },

                {
                  family: {
                    id: "branch-multi",
                    childHandles: [
                      "multi-person",
                    ],
                  },
                  parentHandles: [],
                  childHandles: [
                    "multi-person",
                  ],
                },
              ],

              channels: [],
            },

            /*
            * Generation under test.
            */
            {
              depth: 3,
              layoutType: "normal",
              y: 0,

              slots: [
                {
                  id: ordinaryPersonA.id,
                  type: "person",
                  person:
                    ordinaryPersonA,
                  x: 0,
                },

                {
                  id: ordinaryPersonB.id,
                  type: "person",
                  person:
                    ordinaryPersonB,
                  x: 0,
                },

                {
                  id: twoPartnerPerson.id,
                  type: "person",
                  person:
                    twoPartnerPerson,
                  x: 0,
                },

                {
                  id: twoPartnerSpouse1.id,
                  type: "person",
                  person:
                    twoPartnerSpouse1,
                  x: 0,
                },

                {
                  id: twoPartnerSpouse2.id,
                  type: "person",
                  person:
                    twoPartnerSpouse2,
                  x: 0,
                },

                {
                  id: multiPartnerPerson.id,
                  type: "person",
                  person:
                    multiPartnerPerson,
                  x: 0,
                },

                {
                  id: visibleMultiSpouse.id,
                  type: "person",
                  person:
                    visibleMultiSpouse,
                  x: 0,
                },

                /*
                * Ordinary relationship slot.
                *
                * This is what allows buildFamilyBlocks()
                * to recognise the ordinary couple.
                */
                {
                  id:
                    "relationship-ordinary-family",
                  type:
                    "relationship",
                  family:
                    ordinaryFamily,
                  x: 0,
                },

                /*
                * Multiple-partner synthetic slot.
                */
                {
                  id:
                    "multiple-partner-multi-person",

                  type:
                    "multiple-partner",

                  personHandle:
                    "multi-person",

                  spouseHandles: [
                    "hidden-spouse-1",
                    "hidden-spouse-2",
                  ],

                  visibleFamilyId:
                    "multi-family",

                  visibleSpouseHandle:
                    "multi-visible-spouse",

                  x: 0,
                },
              ],

              families: [
                {
                  family:
                    ordinaryFamily,

                  parentHandles: [
                    "ordinary-a",
                    "ordinary-b",
                  ],

                  childHandles: [
                    "ordinary-child",
                  ],
                },
              ],

              channels: [],
            },
          ],
        };

        const context:
          GenerationContext = {
          dataNodes: [
            ordinaryPersonA,
            ordinaryPersonB,
            twoPartnerPerson,
            twoPartnerSpouse1,
            twoPartnerSpouse2,
            multiPartnerPerson,
            visibleMultiSpouse,
          ],

          /*
          * Two-partner block construction uses
          * the complete family data rather than
          * only generation.families.
          */
          dataFamilies: [
            ordinaryFamily,
            twoFamily1,
            twoFamily2,
            multiFamily,
          ],

          mode:
            "ancestors",

          selectedPersonHandle:
            "selected-person",

          useExpandedLayout:
            false,
        };

        const result =
          orderGenerationSlots(
            displayModel,
            context
          );

        const generation =
          result.generations.find(
            (item) =>
              item.depth === 3
          );

        expect(
          generation
        ).toBeDefined();

        const orderedIds =
          generation!.slots.map(
            (slot) =>
              slot.id
          );

        const ordinaryAIndex =
          orderedIds.indexOf(
            "ordinary-a"
          );

        const ordinaryBIndex =
          orderedIds.indexOf(
            "ordinary-b"
          );

        expect(
          ordinaryAIndex
        ).toBeGreaterThanOrEqual(
          0
        );

        expect(
          ordinaryBIndex
        ).toBeGreaterThanOrEqual(
          0
        );

        /*
        * Regression assertion:
        *
        * No two-spouse or MultiplePartner block
        * may be inserted between this ordinary
        * visible couple.
        */
        expect(
          Math.abs(
            ordinaryAIndex -
            ordinaryBIndex
          )
        ).toBe(
          1
        );
      }
    );

  }
);