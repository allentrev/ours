import type {
  Node,
} from "@xyflow/react";

import type {
  GenerationDisplayModel,
} from "../../../types/upgradeTypes";

/*
 * Convert the completed generation display model
 * into React Flow nodes.
 *
 * No layout decisions are made here.
 * The renderer simply uses the X/Y coordinates
 * already calculated by the generation engine.
 */
export const renderGenerationNodes = (
  displayModel: GenerationDisplayModel,
  selectedPersonHandle: string
): Node[] => {
  const nodes: Node[] = [];

  displayModel.generations.forEach(
    (generation) => {
      generation.slots.forEach(
        (slot) => {
          /*
           * Person
           */
          if (
            slot.type === "person" &&
            slot.person
          ) {
            const person =
              slot.person;

            nodes.push({
              id: slot.id,

              type: "person",

              position: {
                x: slot.x,
                y:
                  generation.y +
                  (slot.yOffset ?? 0),
              },

              data: {
                label:
                  person.label,

                shortId:
                  person.id.slice(-4),

                gender:
                  person.gender,

                birthDate:
                  person.birthDate,

                deathDate:
                  person.deathDate,

                isSelected:
                  person.id ===
                  selectedPersonHandle,

                personHandle:
                  person.id,

                noPartners:
                  person.noPartners,
              },
            });

            return;
          }

          /*
           * Relationship
           */
          if (
            slot.type ===
              "relationship" &&
            slot.family
          ) {
            nodes.push({
              id:
                slot.id,

              type:
                "relationship",

              position: {
                x: slot.x,
                y:
                  generation.y +
                  (slot.yOffset ?? 0),
              },

              data: {
                familyId:
                  slot.family.id,
              },
            });

            return;
          }

          /*
           * Multiple partner
           */
          if (
            slot.type ===
            "multiple-partner"
          ) {
            nodes.push({
              id:
                slot.id,

              type:
                "multiplePartner",

              position: {
                x: slot.x,
                y:
                  generation.y +
                  (slot.yOffset ?? 0),
              },

              data: {
                personHandle:
                  slot.personHandle,

                spouseHandles:
                  slot.spouseHandles ??
                  [],

                noPartners:
                  slot.spouseHandles
                    ?.length ??
                  0,
              },
            });
          }
        }
      );
    }
  );

  return nodes;
};