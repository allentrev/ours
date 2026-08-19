import type {
  TreeMode,
  TreeResponse,
} from "../../../types/familyTypes";

import type {
  GenerationContext,
  GenerationDisplayModel,
} from "../../../types/upgradeTypes";

import {
  buildGenerations,
} from "./buildGenerations";

import {
  populateGenerationSlots,
} from "./populateGenerationSlots";

import {
  layoutGenerations,
} from "./layoutGenerations";

import {
  orderGenerationSlots,
} from "./orderGenerationSlots";

import {
  layoutGenerationSlots,
} from "./layoutGenerationSlots";

import {
  layoutGenerationChannels,
} from "./layoutGenerationChannels";

export const buildGenerationDisplayModel = (
  data: TreeResponse,
  mode: TreeMode
): GenerationDisplayModel => {
  const selectedPersonNode =
    data.nodes.find(
      (node) =>
        node.id ===
        data.selectedPerson.handle
    );

  const useExpandedLayout =
    mode === "descendants" &&
    Number(
      selectedPersonNode?.noPartners ?? 0
    ) > 2;

  const context:
    GenerationContext = {
      dataNodes:
        data.nodes,

      dataFamilies:
        data.families ?? [],

      mode,

      selectedPersonHandle:
        data.selectedPerson.handle,

      useExpandedLayout,
    };

  const generationStructure =
    buildGenerations(data, mode);

  const populatedGenerations =
    populateGenerationSlots(
      generationStructure,
      context
    );

  const orderedGenerations =
    orderGenerationSlots(
      populatedGenerations,
      context
    );

  const generationVerticalLayout =
    layoutGenerations(
      orderedGenerations,
      context
    );

  const generationSlotLayout =
    layoutGenerationSlots(
      generationVerticalLayout,
      context
    );

  const generationChannelLayout =
    layoutGenerationChannels(
      generationSlotLayout,
      context
    );

  return generationChannelLayout;
};