import type {
  Generation,
  GenerationContext,
  GenerationDisplayModel,
} from "../../../types/upgradeTypes";

import {
  SLOT_HEIGHT,
  SLOT_GAP,
  CHANNEL_TOP_MARGIN,
  CHANNEL_SPACING,
  CHANNEL_BOTTOM_MARGIN,
  EMPTY_GENERATION_GAP,
} from "../../../constants/familyTree.constants";

const getGenerationHeight = (
  generation: Generation,
  generationContext: GenerationContext
): number => {
  if (
    generation.layoutType !==
    "expanded-root"
  ) {
    return SLOT_HEIGHT;
  }

  const spouseCount =
    generation.slots.filter(
      (slot) =>
        slot.type === "person" &&
        slot.person?.id !==
          generationContext.selectedPersonHandle
    ).length;

  return Math.max(
    SLOT_HEIGHT,

    spouseCount *
      SLOT_HEIGHT +

    Math.max(
      0,
      spouseCount - 1
    ) *
      SLOT_GAP
  );
};

export const layoutGenerations = (
  displayModel: GenerationDisplayModel,
  generationContext: GenerationContext
): GenerationDisplayModel => {
  let currentY = 0;
  const direction =
    generationContext.mode === "ancestors"
      ? -1
      : 1;
  
      const generations: Generation[] =
    displayModel.generations.map(
      (generation) => {
        const generationHeight =
          getGenerationHeight(
            generation,
            generationContext
          );
        
        const channelCount =
          generation.channels.length;

        /*
         * Allocate absolute Y coordinates
         * for this generation's family channels.
         */
        const channels =
          generation.channels.map(
            (channel, index) => ({
              ...channel,

              y:
                generationContext.mode ===
                "ancestors"
                  ? currentY -
                    CHANNEL_TOP_MARGIN -
                    index * CHANNEL_SPACING
                  : currentY +
                    generationHeight +
                    CHANNEL_TOP_MARGIN +
                    index * CHANNEL_SPACING,
            })
          );
        /*
         * Determine how much routing space
         * this generation requires below it.
         */
        const routingHeight =
          channelCount > 0
            ? CHANNEL_TOP_MARGIN +
              (channelCount - 1) *
                CHANNEL_SPACING +
              CHANNEL_BOTTOM_MARGIN
            : EMPTY_GENERATION_GAP;

        const nextGenerationY =
          currentY +
          direction *
            (
              generationHeight +
              routingHeight
            );

        const laidOutGeneration: Generation = {
          ...generation,
          y: currentY,
          channels,
          nextGenerationY,
        };

        currentY =
          nextGenerationY;

        return laidOutGeneration;
      }
    );

  return {
    generations,
  };
};