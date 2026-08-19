import type {
  TreeMode,
  TreeResponse,
  TreeResponseFamily,
  TreeResponseNode,
} from "../../../types/familyTypes";

import type {
  Generation,
  GenerationDisplayModel,
} from "../../../types/upgradeTypes";

const getPeopleAtDepth = (
  people: TreeResponseNode[],
  depth: number
): TreeResponseNode[] =>
  people.filter(
    (person) =>
      person.depth === depth
  );

const getFamiliesForGeneration = (
  families: TreeResponseFamily[],
  generationPersonIds: Set<string>,
  mode: TreeMode
): TreeResponseFamily[] =>
  families.filter((family) => {
    if (mode === "descendants") {
      const parentHandles = [
        family.fatherHandle,
        family.motherHandle,
      ].filter(
        (handle): handle is string =>
          Boolean(handle)
      );

      return parentHandles.some(
        (handle) =>
          generationPersonIds.has(handle)
      );
    }

    /*
     * Ancestor mode:
     *
     * The family belongs to the generation
     * containing the child from which we are
     * travelling upwards to the parents.
     */
    return family.childHandles.some(
      (childHandle) =>
        generationPersonIds.has(
          childHandle
        )
    );
  });
  
export const buildGenerations = (
  data: TreeResponse,
  mode: TreeMode,
): GenerationDisplayModel => {
  const generations:
    Generation[] = [];

  const maxDepth =
    data.nodes.reduce(
      (maximum, person) =>
        Math.max(
          maximum,
          person.depth
        ),
      0
    );

  for (
    let depth = 0;
    depth <= maxDepth;
    depth++
  ) {
    const generationPeople =
      getPeopleAtDepth(
        data.nodes,
        depth
      );

    if (
      generationPeople.length === 0
    ) {
      continue;
    }

    const generationPersonIds =
      new Set(
        generationPeople.map(
          (person) =>
            person.id
        )
      );

    const generationFamilies =
      getFamiliesForGeneration(
        data.families ?? [],
        generationPersonIds,
        mode
      );

    generations.push({
      depth,

      layoutType: "normal",

      y: 0,

      slots:
        generationPeople.map(
          (person) => ({
            id: person.id,
            type: "person",
            person,
            x: 0,
          })
        ),

      families:
        generationFamilies.map(
          (family) => ({
            family,

            parentHandles: [
              family.fatherHandle,
              family.motherHandle,
            ].filter(
              (
                handle
              ): handle is string =>
                Boolean(handle)
            ),

            childHandles:
              family.childHandles,
          })
        ),

      channels:
        generationFamilies.map(
          (family, index) => ({
            familyId:
              family.id,

            index,
          })
        ),

      nextGenerationY:
        undefined,
    });
  }

  return {
    generations,
  };
};