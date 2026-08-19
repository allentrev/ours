import {
  describe,
  expect,
  it,
} from "vitest";

import {
  renderGenerationEdges,
} from "../renderGenerationEdges";

import type {
  GenerationContext,
  GenerationDisplayModel,
} from "../../../../types/upgradeTypes";

describe(
  "renderGenerationEdges",
  () => {
    it(
      "uses spouse right handle and horizontal-first routing for expanded descendant root",
      () => {
        const displayModel:
          GenerationDisplayModel = {
          generations: [
            {
              depth: 0,

              layoutType:
                "expanded-root",

              y: 0,

              slots: [
                {
                  id: "person",
                  type: "person",

                  person: {
                    id: "person",
                    label: "Person",
                    depth: 0,
                    noPartners: 3,
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

                  x: 280,
                  yOffset: 0,
                },
              ],

              families: [
                {
                  family: {
                    id: "family-1",

                    fatherHandle:
                      "person",

                    motherHandle:
                      "spouse-1",

                    childHandles: [
                      "child-1",
                    ],
                  },

                  parentHandles: [
                    "person",
                    "spouse-1",
                  ],

                  childHandles: [
                    "child-1",
                  ],
                },
              ],

              channels: [
                {
                  familyId:
                    "family-1",

                  index:
                    0,

                  sourceNodeId:
                    "spouse-1",

                  sourceX:
                    280,

                  y:
                    220,

                  startX:
                    280,

                  endX:
                    560,
                },
              ],
            },

            {
              depth: 1,

              layoutType:
                "normal",

              y: 400,

              slots: [
                {
                  id: "child-1",
                  type: "person",

                  person: {
                    id: "child-1",
                    label: "Child 1",
                    depth: 1,
                    noPartners: 0,
                  },

                  x: 560,
                },
              ],

              families: [],
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

            displayModel.generations[1]
              .slots[0].person!,
          ],

          dataFamilies: [
            displayModel.generations[0]
              .families[0].family,
          ],

          mode:
            "descendants",

          selectedPersonHandle:
            "person",

          useExpandedLayout:
            true,
        };

        const edges =
          renderGenerationEdges(
            displayModel,
            context
          );

        const familyChildEdge =
          edges.find(
            (edge) =>
              edge.id ===
              "family-child-family-1-child-1"
          );

        expect(
          familyChildEdge
        ).toBeDefined();

        expect(
          familyChildEdge?.source
        ).toBe(
          "spouse-1"
        );

        expect(
          familyChildEdge?.target
        ).toBe(
          "child-1"
        );

        expect(
          familyChildEdge?.sourceHandle
        ).toBe(
          "spouse-right-source"
        );

        expect(
          familyChildEdge?.type
        ).toBe(
          "familyChild"
        );

        expect(
          familyChildEdge?.data?.routeMode
        ).toBe(
          "generation-horizontal-first"
        );

        expect(
          familyChildEdge?.data?.channelIndex
        ).toBe(
          0
        );
      }
    );

    it(
      "uses relationship bottom handle and generation-channel routing for a normal family",
      () => {
        const displayModel:
          GenerationDisplayModel = {
          generations: [
            {
              depth: 0,

              layoutType:
                "normal",

              y: 0,

              slots: [
                {
                  id: "person",
                  type: "person",

                  person: {
                    id: "person",
                    label: "Person",
                    depth: 0,
                    noPartners: 1,
                  },

                  x: 0,
                },

                {
                  id: "spouse",
                  type: "person",

                  person: {
                    id: "spouse",
                    label: "Spouse",
                    depth: 0,
                    noPartners: 1,
                  },

                  x: 280,
                },

                {
                  id:
                    "relationship-family-1",

                  type:
                    "relationship",

                  family: {
                    id: "family-1",

                    fatherHandle:
                      "person",

                    motherHandle:
                      "spouse",

                    childHandles: [
                      "child-1",
                    ],
                  },

                  x: 140,
                },
              ],

              families: [
                {
                  family: {
                    id: "family-1",

                    fatherHandle:
                      "person",

                    motherHandle:
                      "spouse",

                    childHandles: [
                      "child-1",
                    ],
                  },

                  parentHandles: [
                    "person",
                    "spouse",
                  ],

                  childHandles: [
                    "child-1",
                  ],
                },
              ],

              channels: [
                {
                  familyId:
                    "family-1",

                  index:
                    0,

                  sourceNodeId:
                    "relationship-family-1",

                  sourceX:
                    140,

                  y:
                    220,

                  startX:
                    140,

                  endX:
                    560,
                },
              ],
            },

            {
              depth: 1,

              layoutType:
                "normal",

              y: 400,

              slots: [
                {
                  id: "child-1",
                  type: "person",

                  person: {
                    id: "child-1",
                    label: "Child 1",
                    depth: 1,
                    noPartners: 0,
                  },

                  x: 560,
                },
              ],

              families: [],
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

            displayModel.generations[1]
              .slots[0].person!,
          ],

          dataFamilies: [
            displayModel.generations[0]
              .families[0].family,
          ],

          mode:
            "descendants",

          selectedPersonHandle:
            "person",

          useExpandedLayout:
            false,
        };

        const edges =
          renderGenerationEdges(
            displayModel,
            context
          );

        const familyChildEdge =
          edges.find(
            (edge) =>
              edge.id ===
              "family-child-family-1-child-1"
          );

        expect(
          familyChildEdge
        ).toBeDefined();

        expect(
          familyChildEdge?.source
        ).toBe(
          "relationship-family-1"
        );

        expect(
          familyChildEdge?.target
        ).toBe(
          "child-1"
        );

        expect(
          familyChildEdge?.sourceHandle
        ).toBe(
          "bottom"
        );

        expect(
          familyChildEdge?.type
        ).toBe(
          "familyChild"
        );

        expect(
          familyChildEdge?.data?.routeMode
        ).toBe(
          "generation-channel"
        );
      }
    );

  }
);