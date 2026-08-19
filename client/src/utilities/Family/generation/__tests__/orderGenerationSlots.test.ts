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
  }
);