import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildGenerationDisplayModel,
} from "../buildGenerationDisplayModel";

import type {
  TreeResponse,
} from "../../../../types/familyTypes";

describe(
  "buildGenerationDisplayModel",
  () => {
    /*
     * Ancestor root with more than two partners.
     *
     * The selected person remains visible and
     * all partners are represented by one
     * MultiplePartner slot.
     */
    it(
      "shows selected person plus one MultiplePartner slot in ancestor mode when the person has more than two partners",
      () => {
        const data: TreeResponse = {
          selectedPerson: {
            handle: "person",
            displayName: "Person",
          },

          nodes: [
            {
              id: "person",
              label: "Person",
              depth: 0,
              noPartners: 5,
            },

            {
              id: "spouse-1",
              label: "Spouse 1",
              depth: 0,
              noPartners: 1,
            },

            {
              id: "spouse-2",
              label: "Spouse 2",
              depth: 0,
              noPartners: 1,
            },

            {
              id: "spouse-3",
              label: "Spouse 3",
              depth: 0,
              noPartners: 1,
            },

            {
              id: "spouse-4",
              label: "Spouse 4",
              depth: 0,
              noPartners: 1,
            },

            {
              id: "spouse-5",
              label: "Spouse 5",
              depth: 0,
              noPartners: 1,
            },
          ],

          edges: [],

          families: [
            {
              id: "family-1",
              fatherHandle: "person",
              motherHandle: "spouse-1",
              childHandles: [],
            },

            {
              id: "family-2",
              fatherHandle: "person",
              motherHandle: "spouse-2",
              childHandles: [],
            },

            {
              id: "family-3",
              fatherHandle: "person",
              motherHandle: "spouse-3",
              childHandles: [],
            },

            {
              id: "family-4",
              fatherHandle: "person",
              motherHandle: "spouse-4",
              childHandles: [],
            },

            {
              id: "family-5",
              fatherHandle: "person",
              motherHandle: "spouse-5",
              childHandles: [],
            },
          ],
        };

        const result =
          buildGenerationDisplayModel(
            data,
            "ancestors"
          );

        const rootGeneration =
          result.generations.find(
            (generation) =>
              generation.depth === 0
          );

        expect(
          rootGeneration
        ).toBeDefined();

        /*
         * Ancestor root should contain only:
         *
         * Person | MultiplePartner
         */
        const slotTypes =
          rootGeneration!.slots.map(
            (slot) =>
              slot.type
          );

        expect(
          slotTypes
        ).toEqual([
          "person",
          "multiple-partner",
        ]);

        const multiplePartnerSlot =
          rootGeneration!.slots.find(
            (slot) =>
              slot.type ===
              "multiple-partner"
          );

        expect(
          multiplePartnerSlot
        ).toBeDefined();

        expect(
          multiplePartnerSlot
            ?.personHandle
        ).toBe(
          "person"
        );

        /*
         * All five spouses should be represented
         * by the MultiplePartner node.
         */
        expect(
          multiplePartnerSlot
            ?.spouseHandles
        ).toEqual([
          "spouse-1",
          "spouse-2",
          "spouse-3",
          "spouse-4",
          "spouse-5",
        ]);
      }
    );

    /*
     * Descendant root with more than two
     * partners.
     *
     * This uses the expanded-root layout:
     *
     * Person       Spouse 1
     *              Spouse 2
     *              Spouse 3
     */
    it(
      "keeps all spouses as vertically ordered person slots in expanded descendant root",
      () => {
        const data: TreeResponse = {
          selectedPerson: {
            handle: "person",
            displayName: "Person",
          },

          nodes: [
            {
              id: "person",
              label: "Person",
              depth: 0,
              noPartners: 3,
            },

            {
              id: "spouse-1",
              label: "Spouse 1",
              depth: 0,
              noPartners: 1,
            },

            {
              id: "spouse-2",
              label: "Spouse 2",
              depth: 0,
              noPartners: 1,
            },

            {
              id: "spouse-3",
              label: "Spouse 3",
              depth: 0,
              noPartners: 1,
            },
          ],

          edges: [],

          families: [
            {
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

            {
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

            {
              id: "family-3",
              fatherHandle: "person",
              motherHandle: "spouse-3",
              childHandles: [],

              relationshipDate: {
                value: 2020,
                text: "2020",
                type: "exact",
              },
            },
          ],
        };

        const result =
          buildGenerationDisplayModel(
            data,
            "descendants"
          );

        const rootGeneration =
          result.generations.find(
            (generation) =>
              generation.depth === 0
          );

        expect(
          rootGeneration
        ).toBeDefined();

        /*
         * More than two partners at the
         * descendant root must trigger the
         * expanded layout.
         */
        expect(
          rootGeneration?.layoutType
        ).toBe(
          "expanded-root"
        );

        /*
         * All spouses remain ordinary person
         * slots in the expanded layout.
         */
        const rootPersonIds =
          rootGeneration!.slots
            .filter(
              (slot) =>
                slot.type ===
                "person"
            )
            .map(
              (slot) =>
                slot.person?.id
            );

        expect(
          rootPersonIds
        ).toEqual([
          "person",
          "spouse-1",
          "spouse-2",
          "spouse-3",
        ]);

        /*
         * Expanded descendant layout must not
         * create a MultiplePartner node.
         */
        const multiplePartnerSlots =
          rootGeneration!.slots.filter(
            (slot) =>
              slot.type ===
              "multiple-partner"
          );

        expect(
          multiplePartnerSlots
        ).toHaveLength(
          0
        );

        /*
         * Check the calculated geometry.
         */
        const personSlot =
          rootGeneration!.slots.find(
            (slot) =>
              slot.type ===
                "person" &&
              slot.person?.id ===
                "person"
          );

        const spouse1Slot =
          rootGeneration!.slots.find(
            (slot) =>
              slot.type ===
                "person" &&
              slot.person?.id ===
                "spouse-1"
          );

        const spouse2Slot =
          rootGeneration!.slots.find(
            (slot) =>
              slot.type ===
                "person" &&
              slot.person?.id ===
                "spouse-2"
          );

        const spouse3Slot =
          rootGeneration!.slots.find(
            (slot) =>
              slot.type ===
                "person" &&
              slot.person?.id ===
                "spouse-3"
          );

        expect(
          personSlot
        ).toBeDefined();

        expect(
          spouse1Slot
        ).toBeDefined();

        expect(
          spouse2Slot
        ).toBeDefined();

        expect(
          spouse3Slot
        ).toBeDefined();

        /*
         * Spouses occupy one vertical column.
         */
        expect(
          spouse1Slot!.x
        ).toBe(
          spouse2Slot!.x
        );

        expect(
          spouse2Slot!.x
        ).toBe(
          spouse3Slot!.x
        );

        /*
         * Relationship-date order should
         * determine their vertical order.
         */
        expect(
          spouse1Slot!.yOffset
        ).toBeLessThan(
          spouse2Slot!.yOffset ??
            0
        );

        expect(
          spouse2Slot!.yOffset
        ).toBeLessThan(
          spouse3Slot!.yOffset ??
            0
        );

        /*
         * The selected person sits to the
         * left of the spouse column.
         */
        expect(
          personSlot!.x
        ).toBeLessThan(
          spouse1Slot!.x
        );
      }
    );
    
    it(
      "assigns each expanded descendant family channel to the correct spouse",
      () => {
        const data: TreeResponse = {
          selectedPerson: {
            handle: "person",
            displayName: "Person",
          },

          nodes: [
            {
              id: "person",
              label: "Person",
              depth: 0,
              noPartners: 3,
            },

            {
              id: "spouse-1",
              label: "Spouse 1",
              depth: 0,
              noPartners: 1,
            },

            {
              id: "spouse-2",
              label: "Spouse 2",
              depth: 0,
              noPartners: 1,
            },

            {
              id: "spouse-3",
              label: "Spouse 3",
              depth: 0,
              noPartners: 1,
            },

            {
              id: "child-1",
              label: "Child 1",
              depth: 1,
              noPartners: 0,
            },

            {
              id: "child-2",
              label: "Child 2",
              depth: 1,
              noPartners: 0,
            },

            {
              id: "child-3",
              label: "Child 3",
              depth: 1,
              noPartners: 0,
            },
          ],

          edges: [
            {
              source: "person",
              target: "child-1",
              relationshipType: "parent",
            },

            {
              source: "person",
              target: "child-2",
              relationshipType: "parent",
            },

            {
              source: "person",
              target: "child-3",
              relationshipType: "parent",
            },
          ],

          families: [
            {
              id: "family-1",
              fatherHandle: "person",
              motherHandle: "spouse-1",
              childHandles: [
                "child-1",
              ],

              relationshipDate: {
                value: 2000,
                text: "2000",
                type: "exact",
              },
            },

            {
              id: "family-2",
              fatherHandle: "person",
              motherHandle: "spouse-2",
              childHandles: [
                "child-2",
              ],

              relationshipDate: {
                value: 2010,
                text: "2010",
                type: "exact",
              },
            },

            {
              id: "family-3",
              fatherHandle: "person",
              motherHandle: "spouse-3",
              childHandles: [
                "child-3",
              ],

              relationshipDate: {
                value: 2020,
                text: "2020",
                type: "exact",
              },
            },
          ],
        };

        const result =
          buildGenerationDisplayModel(
            data,
            "descendants"
          );

        const rootGeneration =
          result.generations.find(
            (generation) =>
              generation.depth === 0
          );

        expect(
          rootGeneration
        ).toBeDefined();

        expect(
          rootGeneration?.layoutType
        ).toBe(
          "expanded-root"
        );

        /*
        * Find the channel belonging to
        * each spouse family.
        */
        const family1Channel =
          rootGeneration!.channels.find(
            (channel) =>
              channel.familyId ===
              "family-1"
          );

        const family2Channel =
          rootGeneration!.channels.find(
            (channel) =>
              channel.familyId ===
              "family-2"
          );

        const family3Channel =
          rootGeneration!.channels.find(
            (channel) =>
              channel.familyId ===
              "family-3"
          );

        expect(
          family1Channel
        ).toBeDefined();

        expect(
          family2Channel
        ).toBeDefined();

        expect(
          family3Channel
        ).toBeDefined();

        /*
        * In expanded-root descendant layout,
        * each family connection is owned by
        * that family's spouse node.
        */
        expect(
          family1Channel?.sourceNodeId
        ).toBe(
          "spouse-1"
        );

        expect(
          family2Channel?.sourceNodeId
        ).toBe(
          "spouse-2"
        );

        expect(
          family3Channel?.sourceNodeId
        ).toBe(
          "spouse-3"
        );

        /*
        * Each spouse family should have its
        * own channel index.
        */
        const channelIndexes = [
          family1Channel!.channelIndex,
          family2Channel!.channelIndex,
          family3Channel!.channelIndex,
        ];

        expect(
          new Set(
            channelIndexes
          ).size
        ).toBe(
          3
        );
      }
    );

  }
);