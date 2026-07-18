import { PersonModel } from "../models/Family/person.model.js";
import { FamilyModel } from "../models/Family/family.model.js";

import type {
  PersonRecord,
  FamilyRecord,
  PersonActor,
  ActorChildFamily,
  PersonActorData,

} from "../types/family.types.js"


const modName ="/services/relationship.service/";

export const usePersonRelationships = async (
  personHandle: string
): Promise<PersonActorData> => {
  const funcName = "getPersonRelationships";

  try {

    const selectedPerson = await PersonModel.findOne({
      handle: personHandle,
    })
      .select({
        handle: 1,
        displayName: 1,
      })
      .lean<PersonRecord>();

    if (!selectedPerson) {
      console.warn(
        `${modName}${funcName} Failed to find person ${personHandle}`
      );
      throw new Error("PERSON_NOT_FOUND");
    }

    /*
     * Parent families are families where the selected
     * person appears as a child.
     */
    const parentFamilies = await FamilyModel.find({
      childHandles: personHandle,
    }).lean<FamilyRecord[]>();

    /*
     * Partner families are families where the selected
     * person is one of the parents.
     */
    const partnerFamilies = await FamilyModel.find({
      $or: [
        { fatherHandle: personHandle },
        { motherHandle: personHandle },
      ],
    }).lean<FamilyRecord[]>();

    const siblingHandles = new Set<string>();
    const partnerHandles = new Set<string>();
    const childHandles = new Set<string>();
    const requiredPersonHandles = new Set<string>();

    parentFamilies.forEach((family) => {
      if (family.fatherHandle) {
        requiredPersonHandles.add(family.fatherHandle);
      }

      if (family.motherHandle) {
        requiredPersonHandles.add(family.motherHandle);
      }

      family.childHandles.forEach((handle) => {
        if (handle !== personHandle) {
          siblingHandles.add(handle);
          requiredPersonHandles.add(handle);
        }
      });
    });

    partnerFamilies.forEach((family) => {
      const partnerHandle =
        family.fatherHandle === personHandle
          ? family.motherHandle
          : family.fatherHandle;

      if (partnerHandle) {
        partnerHandles.add(partnerHandle);
        requiredPersonHandles.add(partnerHandle);
      }

      family.childHandles.forEach((handle) => {
        childHandles.add(handle);
        requiredPersonHandles.add(handle);
      });
    });

    const relatedPeople =
      requiredPersonHandles.size > 0
        ? await PersonModel.find({
            handle: {
              $in: Array.from(requiredPersonHandles),
            },
          })
            .select({
              handle: 1,
              displayName: 1,
              surname: 1,
              firstName: 1,
            })
            .lean<PersonRecord[]>()
        : [];

    const peopleByHandle = new Map(
      relatedPeople.map((person) => [
        person.handle,
        person,
      ])
    );

    const childFamilies: ActorChildFamily[] =
      partnerFamilies
        .map((family) => {
          const father = family.fatherHandle
            ? peopleByHandle.get(family.fatherHandle)
            : undefined;

          const mother = family.motherHandle
            ? peopleByHandle.get(family.motherHandle)
            : undefined;

          const parentNames = [
            father?.displayName,
            mother?.displayName,
          ].filter(
            (name): name is string => Boolean(name)
          );

          return {
            handle: family.handle,

            displayName:
              parentNames.length > 0
                ? parentNames.join(" + ")
                : family.grampsId || "Unnamed family",

            fatherHandle: family.fatherHandle,

            motherHandle: family.motherHandle,
          };
        })
        .sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );

    const toActor = (
      handle: string
    ): PersonActor | null => {
      const person = peopleByHandle.get(handle);

      if (!person) {
        return null;
      }

      return {
        handle: person.handle,
        displayName: person.displayName,
      };
    };

    const mapHandlesToActors = (
      handles: Set<string>
    ): PersonActor[] =>
      Array.from(handles)
        .map(toActor)
        .filter(
          (
            actor
          ): actor is PersonActor =>
            actor !== null
        )
        .sort((a, b) =>
          a.displayName.localeCompare(
            b.displayName
          )
        );

    const families: PersonActor[] =
      parentFamilies.map((family) => {
        const father = family.fatherHandle
          ? peopleByHandle.get(
              family.fatherHandle
            )
          : undefined;

        const mother = family.motherHandle
          ? peopleByHandle.get(
              family.motherHandle
            )
          : undefined;

        const surname = father?.surname;

        const parentNames = [
          father?.firstName,
          mother?.firstName,
        ].filter(
          (name): name is string =>
            Boolean(name)
        );

        return {
          handle: family.handle,

          displayName:
            parentNames.length > 0
              ? `${surname} \n ${parentNames.join(" \n ")}`
              : family.grampsId ?? "Family",
        };
      });

    const responseData: PersonActorData = {
      selectedPerson: {
        handle: selectedPerson.handle,
        displayName: selectedPerson.displayName,
      },

      families,
      childFamilies,

      siblings: mapHandlesToActors(
        siblingHandles
      ),

      partners: mapHandlesToActors(
        partnerHandles
      ),

      children: mapHandlesToActors(
        childHandles
      ),
    };
    return responseData;
  } catch (error) {
    console.error(
      `${modName}${funcName}`,
      error
    );
    throw error;
  }
};
