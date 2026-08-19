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
    it(
  "keeps all spouses as person slots in expanded descendant root",
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

    const rootPersonIds =
      rootGeneration!.slots
        .filter(
          (slot) =>
            slot.type === "person"
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
  }
    );
  }
);