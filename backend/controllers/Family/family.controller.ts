import type { Request, Response, NextFunction} from "express";
import type {} from "multer";

import { FamilyModel } from "../../models/Family/family.model.js";

import { withTransaction } from "../../lib/withTransaction.js";
import { createdResponse, successResponse, } from "../../lib/apiResponse.js";

import { resolveNoteHandles } from "../../services/noteResolver.js";
import { readFamilyService, } from "../../services/readFamily.service.js";

import { 
  generateHandle,
  generateLocalFamilyId,
} from "../../lib/familyIdGenerator.js";

import {
  FamilyValidationError,
  validateFamilyRelationships,
} from "../../services/validateFamily.service.js";
import { AppError } from "../../lib/AppError.js";

import type {
  FamilyRecord,
  FamilyDocument,
  UpdateFamilyRequestBody,
  NewNoteInput,
} from "../../types/family.types.js"

const modName ="/controllers/family.controller/";

export const getAllFamilies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    try {
        //console.log("family.controller, getAllFamilies");
        const families = await FamilyModel.find().lean<FamilyRecord[]>();
        return successResponse(
          res,
          families,
          "Families retrieved successfully."
        );
    } catch (error) {
        next(error);
    }
};

export const createFamily = async (
  req: Request<
    {},
    {},
    {
      family: Partial<FamilyDocument>;
      newNotes?: NewNoteInput[];
    }
  >,
  res: Response,
  next: NextFunction
) => {
  const funcName = "createFamily";

  try {
    const clerkUserId =
      req.currentUser?.clerkUserId;

    if (!clerkUserId) {
      throw new AppError(
        401,
        "Authenticated user is unavailable."
      );
    }

    const {
      family,
      newNotes = [],
    } = req.body;

    if (!family) {
      return res.status(400).json({
        success: false,
        message:
          "Family data is required",
      });
    }

    const savedFamily =
      await withTransaction(
        async (session) => {
          const validatedRelationships =
            await validateFamilyRelationships(
              family,
              session
          );

          const handle =
            generateHandle();

          const localId =
            generateLocalFamilyId();

          const noteHandles =
            await resolveNoteHandles(
              family.noteHandles ?? [],
              newNotes,
              session,
              clerkUserId,
            );

          const createdFamilies =
            await FamilyModel.create(
              [
                {
                  ...family,
                  ...validatedRelationships,

                  handle,
                  grampsId: localId,
                  localId,
                  origin: "local",

                  noteHandles,

                  createdByUserId:
                    clerkUserId,

                  updatedByUserId:
                    clerkUserId,
                },
              ],
              {
                session,
              }
            );

          return createdFamilies[0];
        }
      );

      return createdResponse(
        res,
        savedFamily,
        "Family created successfully."
      );
  } catch (error) {
    next(error);
  }
};

export const readFamily = async (
  req: Request<{ familyId: string }>,
  res: Response,
  next: NextFunction
) => {
  const funcName = "readFamily";

  try {
    const data = await readFamilyService(
      req.params.familyId
    );

    return successResponse(
      res,
      data,
      "Family retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const updateFamily = async (
  req: Request<
    { familyId: string },
    {},
    {
      family: Partial<FamilyDocument>;
      newNotes?: NewNoteInput[];
    }
  >,
  res: Response,
  next: NextFunction
) => {
  const funcName = "updateFamily";

  try {
    const clerkUserId =
      req.currentUser?.clerkUserId;

    if (!clerkUserId) {
      throw new AppError(
        401,
        "Authenticated user is unavailable."
      );
    }

    const familyId =
      req.params.familyId;

    const {
      family,
      newNotes = [],
    } = req.body;

    /*
    console.log(
      `${modName}${funcName} family, newNotes`,
      family,
      newNotes
    );
    */
    
    if (!family) {
      throw new AppError(
        400,
        "Family data is required."
      );
    }

    const updatedFamily =
      await withTransaction(
        async (session) => {
          const existingFamily =
            await FamilyModel.findOne({
              handle: familyId,
            }).session(session);

          if (!existingFamily) {
            return null;
          }

          /*
           * The client sends the complete editable
           * family record. Validate that submitted
           * state directly so omitted parent fields
           * are treated as removals.
           */
          const validatedRelationships =
            await validateFamilyRelationships(
              family,
              session
            );

          const noteHandles =
            await resolveNoteHandles(
              family.noteHandles ??
                existingFamily.noteHandles ??
                [],
              newNotes,
              session,
              clerkUserId,
            );

          /*
           * Remove fields that must not be controlled
           * directly by the client or that require
           * explicit relationship handling below.
           */
          const {
            handle: _ignoredHandle,
            createdByUserId:
              _ignoredCreatedByUserId,
            updatedByUserId:
              _ignoredUpdatedByUserId,

            fatherHandle:
              _ignoredFatherHandle,
            motherHandle:
              _ignoredMotherHandle,
            childHandles:
              _ignoredChildHandles,

            ...safeFamily
          } = family;

          const fieldsToSet: Record<
            string,
            unknown
          > = {
            ...safeFamily,

            childHandles:
              validatedRelationships
                .childHandles,

            noteHandles,

            updatedByUserId:
              clerkUserId,
          };

          const fieldsToUnset: Record<
            string,
            1
          > = {};

          if (
            validatedRelationships
              .fatherHandle
          ) {
            fieldsToSet.fatherHandle =
              validatedRelationships
                .fatherHandle;
          } else {
            fieldsToUnset.fatherHandle = 1;
          }

          if (
            validatedRelationships
              .motherHandle
          ) {
            fieldsToSet.motherHandle =
              validatedRelationships
                .motherHandle;
          } else {
            fieldsToUnset.motherHandle = 1;
          }

          const updateOperation: {
            $set: Record<string, unknown>;
            $unset?: Record<string, 1>;
          } = {
            $set: fieldsToSet,
          };

          if (
            Object.keys(
              fieldsToUnset
            ).length > 0
          ) {
            updateOperation.$unset =
              fieldsToUnset;
          }

          return FamilyModel.findOneAndUpdate(
            {
              handle: familyId,
            },
            updateOperation,
            {
              new: true,
              runValidators: true,
              session,
            }
          );
        }
      );

    if (!updatedFamily) {
      throw new AppError(
        404,
        "Family not found."
      );
    }

    return successResponse(
      res,
      updatedFamily,
      "Family updated successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const deleteFamily = async (
    req: Request<{ familyId: string }>,
    res: Response,
    next: NextFunction
) => {
  try {
    console.log("family.controller, deleteFamily");
    const wFamilyId = req.params.familyId;

    const deletedFamily = await FamilyModel.findOneAndDelete({ handle: wFamilyId });

    if (!deletedFamily) {
        return res
            .status(404)
            .json({ message: "Family not found or already deleted" });
    }
    return successResponse(
      res,
      {
        handle:
          deletedFamily.handle,
      },
      "Family deleted successfully."
    );
  } catch (error) {
    next(error);
  }
};
