import type {
  Node,
} from "@xyflow/react";

import type {
  FamilyTreeEdge,
} from "../../types/familyTypes";

import type {
  LayoutContext,
} from "./layoutTypes";

export const buildTreeEdges = (
  context: LayoutContext,
  multiPartnerBaseNodes: Node[]
): FamilyTreeEdge[] => {
  const {
    data,
    mode,
    visibleFamilies,
    selectedFamilies,
    selectedPersonHandle,
    selectedPersonHiddenSpouseIds,
    useExpandedLayout,
  } = context;

  const BORDER_RADIUS = 50;

  /*
   * Standard family-child edge channels.
   *
   * These are used by the normal vertical-channel
   * route inside FamilyChildEdge.
    */
  const FAMILY_CHANNEL_START = 60;
  const FAMILY_CHANNEL_SPACING = 25;

  /*
   * Expanded multi-spouse routing.
   *
   * Each successive spouse travels farther
   * horizontally before turning downwards.
   */
  const SPOUSE_CHANNEL_START = 45;
  const SPOUSE_CHANNEL_SPACING = 25;
  
  const EXPANDED_TARGET_START = 0;
  const EXPANDED_TARGET_SPACING = 25;

  const visiblePersonIds =
    new Set(
      data.nodes
        .filter(
          (node) =>
            mode === "ancestors" ||
            !selectedPersonHiddenSpouseIds.includes(
              node.id
            )
        )
        .map(
          (node) =>
            node.id
        )
    );

  const familyEdges: FamilyTreeEdge[] =
    visibleFamilies.flatMap(
      (
        family,
        familyIndex
      ) => {

        const familyChannelOffset =
          FAMILY_CHANNEL_START +
          familyIndex * FAMILY_CHANNEL_SPACING;

        const parentHandles = [
          family.fatherHandle,
          family.motherHandle,
        ].filter(
          Boolean
        ) as string[];

        /*
         * In the normal descendant layout, hide
         * families whose spouse is represented by
         * a multiple-partner marker.
         */
        if (
          mode ===
            "descendants" &&
          !useExpandedLayout &&
          parentHandles.some(
            (handle) =>
              selectedPersonHiddenSpouseIds.includes(
                handle
              )
          )
        ) {
          return [];
        }

        /* -------------------------------------------------------------- */
        /* Expanded multi-spouse layout                                   */
        /* -------------------------------------------------------------- */

        if (
          useExpandedLayout &&
          selectedFamilies.includes(
            family
          )
        ) {
          const selectedDisplayId =
            `${selectedPersonHandle}::${family.id}`;

          const spouseOrdinal =
            selectedFamilies.findIndex(
              (
                selectedFamily
              ) =>
                selectedFamily.id ===
                family.id
            );

          const safeSpouseOrdinal =
            Math.max(spouseOrdinal, 0);

          const channelOffset =
            SPOUSE_CHANNEL_START +
            safeSpouseOrdinal *
              SPOUSE_CHANNEL_SPACING;

          const targetOffset =
            EXPANDED_TARGET_START +
            safeSpouseOrdinal *
              EXPANDED_TARGET_SPACING;

          const spouseHandle =
            family.fatherHandle ===
            selectedPersonHandle
              ? family.motherHandle
              : family.fatherHandle;

          const spouseEdges:
            FamilyTreeEdge[] =
              spouseHandle
                ? [
                    {
                      id:
                        `edge-${selectedDisplayId}-${spouseHandle}`,
                      familyId: family.id,
                      source:
                        `multiple-partner-${selectedDisplayId}`,

                      target:
                        spouseHandle,

                      type:
                        "straight",

                      sourceHandle:
                        "spouse-right-source",

                      targetHandle:
                        "spouse-left-target",

                      style: {
                        strokeWidth:
                          2.5,

                        stroke:
                          "#374151",
                      },
                    },
                  ]
                : [];

          const visibleChildHandles =
            family.childHandles.filter(
              (
                childHandle
              ) =>
                visiblePersonIds.has(
                  childHandle
                )
            );

          const childEdges:
            FamilyTreeEdge[] =
              spouseHandle
                ? visibleChildHandles.map(
                    (
                      childHandle
                    ) => ({
                      id:
                        `edge-${selectedDisplayId}-${childHandle}-${family.id}`,
                      familyId: family.id,
                      source:
                        spouseHandle,

                      target:
                        childHandle,

                      type:
                        "familyChild",

                      className:
                        "child-edge",

                      sourceHandle:
                        "spouse-right-source",

                      targetHandle:
                        "top-target",

                      interactionWidth:
                        30,

                      data: {
                        routeMode:
                          "horizontal-first",

                        /*
                         * Controls how far right the
                         * edge travels before dropping.
                         */
                        channelOffset,
                        targetOffset,
                      },

                      pathOptions: {
                        borderRadius:
                          BORDER_RADIUS,
                      },

                      style: {
                        strokeWidth:
                          2.5,

                        stroke:
                          "#2563eb",
                      },
                    })
                  )
                : [];

          return [
            ...spouseEdges,
            ...childEdges,
          ];
        }

        /* -------------------------------------------------------------- */
        /* Single-parent family                                           */
        /* -------------------------------------------------------------- */

        if (parentHandles.length === 1) {
          const parentHandle =
            parentHandles[0];

          return family.childHandles
            .filter((childHandle) =>
              visiblePersonIds.has(
                childHandle
              )
            )
            .map((childHandle) => ({
              id:
                `edge-${parentHandle}-${childHandle}`,

              familyId:
                family.id,

              source:
                parentHandle,

              target:
                childHandle,

              type:
                "familyChild",

              className:
                "child-edge",

              sourceHandle:
                "bottom-source",

              targetHandle:
                "top-target",

              interactionWidth:
                30,

              data: {
                routeMode:
                  "vertical-channel",

                channelOffset:
                  familyChannelOffset,
              },

              pathOptions: {
                borderRadius:
                  BORDER_RADIUS,
              },

              style: {
                strokeWidth:
                  2.5,

                stroke:
                  "#2563eb",
              },
            }));
        }
        /* -------------------------------------------------------------- */
        /* Normal two-parent family                                       */
        /* -------------------------------------------------------------- */

        const relationshipNodeId =
          `relationship-${family.id}`;

        const spouseEdges:
          FamilyTreeEdge[] = [
            {
              id:
                `edge-${family.fatherHandle}-${relationshipNodeId}`,
              familyId: family.id,

              source:
                family.fatherHandle!,

              target:
                relationshipNodeId,

              type:
                "straight",

              sourceHandle:
                "spouse-right-source",

              targetHandle:
                "left",

              style: {
                strokeWidth:
                  2.5,

                stroke:
                  "#374151",
              },
            },

            {
              id:
                `edge-${family.motherHandle}-${relationshipNodeId}`,
              familyId: family.id,

              source:
                family.motherHandle!,

              target:
                relationshipNodeId,

              type:
                "straight",

              sourceHandle:
                "spouse-left-source",

              targetHandle:
                "right-target",

              style: {
                strokeWidth:
                  2.5,

                stroke:
                  "#374151",
              },
            },
          ];

        const childEdges:
          FamilyTreeEdge[] =
            family.childHandles
              .filter(
                (
                  childHandle
                ) =>
                  visiblePersonIds.has(
                    childHandle
                  )
              )
              .map(
                (
                  childHandle
                ) => ({
                  id:
                    `edge-${relationshipNodeId}-${childHandle}`,
                  familyId: family.id,

                  source:
                    relationshipNodeId,

                  target:
                    childHandle,

                  type:
                    "familyChild",

                  className:
                    "child-edge",

                  animated:
                    true,

                  sourceHandle:
                    "bottom",

                  targetHandle:
                    "top-target",

                  interactionWidth:
                    30,

                  data: {
                    /*
                     * No routeMode means the custom
                     * edge defaults to vertical-channel.
                     */
                    channelOffset: familyChannelOffset,
                  },

                  pathOptions: {
                    borderRadius:
                      BORDER_RADIUS,
                  },

                  style: {
                    strokeWidth:
                      2.5,

                    stroke:
                      "#2563eb",
                  },
                })
              );

        return [
          ...spouseEdges,
          ...childEdges,
        ];
      }
    );

  /* -------------------------------------------------------------------- */
  /* Multiple-partner marker edges                                        */
  /* -------------------------------------------------------------------- */

  const multiplePartnerEdges:
    FamilyTreeEdge[] =
      multiPartnerBaseNodes.flatMap(
        (node) => {
          const relationshipNodeId =
            `relationship-${node.id}`;

          const markerNodeId =
            node.id;

          const spouseNodeId =
            node.id.slice(
              17
            );

          const relatedFamilies =
            data.families?.filter(
              (family) =>
                family.fatherHandle ===
                  spouseNodeId ||
                family.motherHandle ===
                  spouseNodeId
            ) ?? [];

          const relatedFamily = relatedFamilies[0];
          if (!relatedFamily) {
            return [];
          }

          const familyId = relatedFamily.id;

          const directEdges:
            FamilyTreeEdge[] =
              mode ===
              "ancestors"
                ? [
                    {
                      id:
                        `edge-${markerNodeId}-${spouseNodeId}`,
                      familyId: familyId,

                      source:
                        node.id,

                      target:
                        spouseNodeId,

                      type:
                        "straight",

                      sourceHandle:
                        "spouse-right-source",

                      targetHandle:
                        "spouse-left-target",

                      style: {
                        strokeWidth:
                          2.5,

                        stroke:
                          "#374151",
                      },
                    },
                  ]
                : [
                    {
                      id:
                        `edge-${node.id}-${relationshipNodeId}`,
                      familyId: familyId,

                      source:
                        node.id,

                      target:
                        relationshipNodeId,

                      type:
                        "straight",

                      sourceHandle:
                        "spouse-left-source",

                      targetHandle:
                        "left",

                      style: {
                        strokeWidth:
                          2.5,

                        stroke:
                          "#374151",
                      },
                    },

                    {
                      id:
                        `edge-${relationshipNodeId}-${markerNodeId}`,
                      familyId: familyId,

                      source:
                        relationshipNodeId,

                      target:
                        spouseNodeId,

                      type:
                        "straight",

                      sourceHandle:
                        "left-source",

                      targetHandle:
                        "spouse-right-target",

                      style: {
                        strokeWidth:
                          2.5,

                        stroke:
                          "#374151",
                      },
                    },
                  ];

          const childEdges:
            FamilyTreeEdge[] =
              relatedFamilies.flatMap(
                (family) =>
                  family.childHandles
                    .filter(
                      (
                        childHandle
                      ) =>
                        visiblePersonIds.has(
                          childHandle
                        )
                    )
                    .map(
                      (
                        childHandle
                      ) => {
                        const targetNodeId =
                          mode ===
                          "ancestors"
                            ? markerNodeId
                            : childHandle;

                        return {
                          id:
                            `edge-${relationshipNodeId}-${targetNodeId}-${childHandle}`,
                          familyId: family.id,

                          source:
                            relationshipNodeId,

                          target:
                            targetNodeId,

                          type:
                            "smoothstep",

                          sourceHandle:
                            "bottom",

                          className:
                            "child-edge",

                          targetHandle:
                            mode ===
                            "ancestors"
                              ? "right"
                              : "top-target",

                          pathOptions: {
                            borderRadius:
                              BORDER_RADIUS,
                          },

                          style: {
                            strokeWidth:
                              2.5,

                            stroke:
                              "#2563eb",

                            strokeDasharray:
                              "6 4",
                          },
                        };
                      }
                    )
              );

          return [
            ...directEdges,
            ...childEdges,
          ];
        }
      );

  return [
    ...familyEdges,
    ...multiplePartnerEdges,
  ];
};