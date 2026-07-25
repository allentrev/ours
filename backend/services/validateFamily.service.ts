// services/validateFamily.service.ts

import type {
  ClientSession,
} from "mongoose";

import {
  PersonModel,
} from "../models/Family/person.model.js";

import { AppError, } from "../lib/AppError.js";

import type {
  FamilyRecord,
} from "../types/family.types.js";

const modName = "/services/validateFamily/";

export class FamilyValidationError
  extends AppError {
  constructor(message: string) {
    super(400, message);

    this.name =
      "FamilyValidationError";
  }
}

const normalizeHandle = (
  handle?: string | null
): string | undefined => {
  const trimmed =
    handle?.trim();

  return trimmed || undefined;
};

export interface ValidatedFamilyData {
  fatherHandle?: string;
  motherHandle?: string;
  childHandles: string[];
}

export const validateFamilyRelationships =
  async (
    family: Partial<FamilyRecord>,
    session?: ClientSession
  ): Promise<ValidatedFamilyData> => {
    const funcName="validateFamilyRelationships";
    const fatherHandle =
      normalizeHandle(
        family.fatherHandle
      );

    const motherHandle =
      normalizeHandle(
        family.motherHandle
      );

    const submittedChildHandles =
      family.childHandles ?? [];

    const childHandles =
      submittedChildHandles
        .map(normalizeHandle)
        .filter(
          (
            handle
          ): handle is string =>
            Boolean(handle)
        );

    /*
     * Detect duplicates before using Set
     * to normalise the final result.
     */
    const duplicateChildHandle =
      childHandles.find(
        (handle, index) =>
          childHandles.indexOf(
            handle
          ) !== index
      );

    if (duplicateChildHandle) {
      const wMsg="The same child cannot be added to a family more than once."
      console.log(`${modName}${funcName} ${wMsg} `)
      throw new FamilyValidationError(
        wMsg
      );
    }

    if (
      fatherHandle &&
      motherHandle &&
      fatherHandle === motherHandle
    ) {
      const wMsg="The same person cannot be both parents in a family."
      console.log(`${modName}${funcName} ${wMsg} `)
      throw new FamilyValidationError(
        wMsg
      );
    }

    if (
      fatherHandle &&
      childHandles.includes(
        fatherHandle
      )
    ) {
      const wMsg="The father cannot also be a child in the same family."
      console.log(`${modName}${funcName} ${wMsg} `)
      throw new FamilyValidationError(
        wMsg
      );
    }

    if (
      motherHandle &&
      childHandles.includes(
        motherHandle
      )
    ) {
      const wMsg="The mother cannot also be a child in the same family."
      console.log(`${modName}${funcName} ${wMsg} `)
      throw new FamilyValidationError(
        wMsg
      );
    }

    if (
      !fatherHandle &&
      !motherHandle &&
      childHandles.length === 0
    ) {
      const wMsg="A family must contain at least one parent or child."
      console.log(`${modName}${funcName} ${wMsg} `)
      throw new FamilyValidationError(
        wMsg
      );
    }

    const referencedHandles = [
      fatherHandle,
      motherHandle,
      ...childHandles,
    ].filter(
      (
        handle
      ): handle is string =>
        Boolean(handle)
    );

    const uniqueReferencedHandles = [
      ...new Set(
        referencedHandles
      ),
    ];

    if (
      uniqueReferencedHandles.length >
      0
    ) {
      const query =
        PersonModel.find({
          handle: {
            $in:
              uniqueReferencedHandles,
          },
        }).select({
          handle: 1,
        });

      if (session) {
        query.session(session);
      }

      const existingPeople =
        await query.lean<
          Array<{
            handle: string;
          }>
        >();

      const existingHandles =
        new Set(
          existingPeople.map(
            (person) =>
              person.handle
          )
        );

      const missingHandles =
        uniqueReferencedHandles.filter(
          (handle) =>
            !existingHandles.has(
              handle
            )
        );

      if (
        missingHandles.length > 0
      ) {
        let wMsg=`The following people do not exist: ${missingHandles.join(
            ", "
          )}`;
        console.log(`${modName}${funcName}${wMsg}`)
        throw new FamilyValidationError(
          wMsg
        );
      }
    }
    console.log(`${modName}${funcName} completed ok`)
    return {
      fatherHandle,
      motherHandle,
      childHandles,
    };
  };