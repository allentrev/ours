import { PersonModel } from "../models/Family/person.model.js";
import { FamilyModel } from "../models/Family/family.model.js";

import {
  generateHandle,
  generateLocalPersonId,
  generateLocalFamilyId,
} from "../lib/familyIdGenerator.js";

import { withTransaction } from "../lib/withTransaction.js";

import type {
  CreateRelatedPersonBody,
  FamilyDocument,
} from "../types/family.types.js";

const modName ="/services/relatedPerson.service/";

export const useCreateRelatedPerson = async (
  input: CreateRelatedPersonBody,
  clerkUserId: string
) => {
  const {
    sourcePersonHandle,
    relationshipType,
    familyHandle,
    person,
  } = input;

  const  funcName="useCreateRelatedPerson";
  console.log(`${modName}${funcName}`);

  const firstName =
    person.firstName?.trim() ?? "";

  const surname =
    person.surname?.trim() ?? "";

  const displayName =
    person.displayName?.trim() ||
    [firstName, surname]
      .filter(Boolean)
      .join(" ");

  return withTransaction(async (session) => {
    const sourcePerson =
      await PersonModel.findOne({
        handle: sourcePersonHandle,
      }).session(session);

    if (!sourcePerson) {
      throw new Error(
        "SOURCE_PERSON_NOT_FOUND"
      );
    }

    const newPersonHandle =
      generateHandle();

    const newPersonLocalId =
      generateLocalPersonId();

    const createdPeople =
      await PersonModel.create(
        [
          {
            handle: newPersonHandle,
            origin: "local",
            localId: newPersonLocalId,
            grampsId: newPersonLocalId,

            firstName: firstName || undefined,
            surname: surname || undefined,
            displayName,
            gender: person.gender || "Unknown",
            birthDate: person.birthDate || undefined,
            deathDate: person.deathDate || undefined,
            deceased:Boolean( person.deathDate ),
            birthPlaceHandle: person.birthPlaceHandle || undefined,
            deathPlaceHandle: person.deathPlaceHandle || undefined,
            primaryPhotoUrl: person.primaryPhotoUrl || undefined,

            mediaHandles: [],
            noteHandles: [],

            createdByUserId: clerkUserId,
            updatedByUserId: clerkUserId,

          },
        ],
        {
          session,
        }
      );

    const createdPerson =
      createdPeople[0];

    let affectedFamily:
      | FamilyDocument
      | null = null;

    /*
     * Add Partner
     *
     * Create a new family containing the
     * source person and the new partner.
     */
    if (
      relationshipType ===
      "addPartner"
    ) {
      const newPartnerFamilyHandle =
        generateHandle();

      const newPartnerFamilyLocalId =
        generateLocalFamilyId();

      const sourceGender =
        sourcePerson.gender
          ?.toLowerCase();

      const newPersonGender =
        createdPerson.gender
          ?.toLowerCase();

      let fatherHandle:
        | string
        | undefined;

      let motherHandle:
        | string
        | undefined;

      if (sourceGender === "male") {
        fatherHandle =
          sourcePerson.handle;

        motherHandle =
          createdPerson.handle;
      } else if (
        sourceGender === "female"
      ) {
        motherHandle =
          sourcePerson.handle;

        fatherHandle =
          createdPerson.handle;
      } else if (
        newPersonGender === "male"
      ) {
        fatherHandle =
          createdPerson.handle;

        motherHandle =
          sourcePerson.handle;
      } else if (
        newPersonGender === "female"
      ) {
        motherHandle =
          createdPerson.handle;

        fatherHandle =
          sourcePerson.handle;
      } else {
        /*
         * Stable fallback where both
         * genders are unknown.
         */
        fatherHandle =
          sourcePerson.handle;

        motherHandle =
          createdPerson.handle;
      }

      const createdFamilies =
        await FamilyModel.create(
          [
            {
              handle: newPartnerFamilyHandle,
              origin: "local",
              localId: newPartnerFamilyLocalId,
              grampsId: newPartnerFamilyLocalId,

              fatherHandle,
              motherHandle,

              childHandles: [],

              relationshipType:
                "Unknown",

              mediaHandles: [],
              noteHandles: [],

              createdByUserId: clerkUserId,
              updatedByUserId: clerkUserId,

            },
          ],
          {
            session,
          }
        );

      affectedFamily =
        createdFamilies[0];

      return {
        person: createdPerson,
        family: affectedFamily,
      };
    }

    /*
     * Add Child
     *
     * Add the child to the supplied family,
     * or create a new single-parent family.
     */
    if (
      relationshipType ===
      "addChild"
    ) {
      if (familyHandle) {
        const existingFamily =
          await FamilyModel.findOne({
            handle: familyHandle,

            $or: [
              {
                fatherHandle:
                  sourcePerson.handle,
              },
              {
                motherHandle:
                  sourcePerson.handle,
              },
            ],
          }).session(session);

        if (!existingFamily) {
          throw new Error(
            "CHILD_FAMILY_NOT_FOUND"
          );
        }

        if (
          !existingFamily.childHandles.includes(
            createdPerson.handle
          )
        ) {
          existingFamily.childHandles.push(
            createdPerson.handle
          );
        }
        
        existingFamily.updatedByUserId =
          clerkUserId;
        
        await existingFamily.save({
          session,
        });

        return {
          person: createdPerson,
          family: existingFamily,
        };
      }

      const newChildFamilyHandle =
        generateHandle();

      const newChildFamilyLocalId =
        generateLocalFamilyId();

      const sourceGender =
        sourcePerson.gender
          ?.toLowerCase();

      let fatherHandle:
        | string
        | undefined;

      let motherHandle:
        | string
        | undefined;

      if (sourceGender === "female") {
        motherHandle =
          sourcePerson.handle;
      } else {
        fatherHandle =
          sourcePerson.handle;
      }

      const createdFamilies =
        await FamilyModel.create(
          [
            {
              handle: newChildFamilyHandle,
              origin: "local",
              localId: newChildFamilyLocalId,
              grampsId: newChildFamilyLocalId,

              fatherHandle,
              motherHandle,

              childHandles: [
                createdPerson.handle,
              ],

              relationshipType:
                "Unknown",

              mediaHandles: [],
              noteHandles: [],

              createdByUserId: clerkUserId,
              updatedByUserId: clerkUserId,
            },
          ],
          {
            session,
          }
        );

      return {
        person: createdPerson,
        family: createdFamilies[0],
      };
    }
    if (relationshipType !== "addSibling") {
      throw new Error(
        "INVALID_RELATIONSHIP_TYPE"
      );
    }
    /*
     * Add Sibling
     *
     * Add the new person to an existing
     * parent family where possible.
     */
    const parentFamily =
      await FamilyModel.findOne({
        childHandles:
          sourcePerson.handle,
      }).session(session);

    if (parentFamily) {
      if (
        !parentFamily.childHandles.includes(
          createdPerson.handle
        )
      ) {
        parentFamily.childHandles.push(
          createdPerson.handle
        );
      }
      parentFamily.updatedByUserId =
        clerkUserId;
      
      await parentFamily.save({
        session,
      });

      affectedFamily =
        parentFamily;

      return {
        person: createdPerson,
        family: affectedFamily,
      };
    }

    /*
     * The source person has no parent
     * family, so create one with unknown
     * parents and both people as children.
     */
    const newSiblingFamilyHandle =
      generateHandle();

    const newSiblingFamilyLocalId =
      generateLocalFamilyId();

    const createdFamilies =
      await FamilyModel.create(
        [
          {
            handle: newSiblingFamilyHandle,
            origin: "local",
            localId: newSiblingFamilyLocalId,
            grampsId: newSiblingFamilyLocalId,

            fatherHandle:
              undefined,

            motherHandle:
              undefined,

            childHandles: [
              sourcePerson.handle,
              createdPerson.handle,
            ],

            relationshipType:
              "Unknown",

            mediaHandles: [],
            noteHandles: [],

            createdByUserId: clerkUserId,
            updatedByUserId: clerkUserId,
          },
        ],
        {
          session,
        }
      );

    affectedFamily =
      createdFamilies[0];

    return {
      person: createdPerson,
      family: affectedFamily,
    };
  });
};