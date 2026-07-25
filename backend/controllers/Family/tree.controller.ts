import type { Request, Response, NextFunction } from "express";
import type {} from "multer";

import { PersonModel } from "../../models/Family/person.model.js";
import type { PersonRecord, } from "../../types/family.types.js"


import { parseGrampsBuffer } from "../../lib/grampsParser.js";

import { buildFamilyTreeFromDb } from "../../services/familyTreeDb.service.js";

const modName ="/controllers/family.controller/";

export const getDefaultFamilyPersonHandle = async (): Promise<string> => {
  const person = await PersonModel.findOne({})
    .sort({ createdAt: -1 })
    .lean<PersonRecord>();

  if (!person) {
    throw new Error("No family people found");
  }

  return person.handle;
};


export const getFamilyTree = async (req: Request, res: Response) => {
  try {
    const personHandle =
      typeof req.query.personHandle === "string"
        ? req.query.personHandle
        : undefined;

    const startPersonHandle =
      personHandle ?? (await getDefaultFamilyPersonHandle());

    const mode =
      req.query.mode === "ancestors" ? "ancestors" : "descendants";

    const { selectedPerson, tree } = await buildFamilyTreeFromDb(
      startPersonHandle,
      mode
    );

    return res.status(200).json({
      success: true,
      message: "Family tree retrieved successfully",
      data: {
        selectedPerson,
        ...tree,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve family tree",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

import {
  successResponse,
} from "../../lib/apiResponse.js";

export const searchFamilyPeople = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query =
      typeof req.query.q === "string"
        ? req.query.q.trim()
        : "";

    if (query.length < 2) {
      return successResponse(
        res,
        [],
        "Enter at least two characters to search."
      );
    }

    const results =
      await PersonModel.find({
        displayName: {
          $regex: query,
          $options: "i",
        },
      })
        .sort({
          displayName: 1,
        })
        .limit(20)
        .lean<PersonRecord[]>();

    return successResponse(
      res,
      results,
      "Family people retrieved successfully."
    );
  } catch (error) {
    next(error);
  }
};