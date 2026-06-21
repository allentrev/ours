// backend/controllers/family.controller.ts

import type { Request, Response } from "express";

import { PersonModel } from "../models/Family/person.model.js";

import { parseGrampsBuffer } from "../lib/grampsParser.js";

import { buildFamilyTreeFromDb } from "../services/familyTreeDb.service.js";
import { importFamilyDataToMongo } from "../services/familyImport.service.js";

const getDefaultFamilyPersonHandle = async (): Promise<string> => {
  const person = await PersonModel.findOne({})
    .sort({ createdAt: -1 })
    .lean();

  if (!person) {
    throw new Error("No family people found");
  }

  return person.handle;
};

export const importGrampsFile = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Gramps file uploaded",
      });
    }

    const parsedData = parseGrampsBuffer(req.file.buffer);

    const result = await importFamilyDataToMongo(
      parsedData,
      req.file.originalname
    );

    return res.status(200).json({
      success: true,
      message: "Gramps file imported successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to import Gramps file",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
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

export const searchFamilyPeople = async (
  req: Request,
  res: Response
) => {
  try {
    const query =
      typeof req.query.q === "string" ? req.query.q.trim() : "";

    const results = await PersonModel.find({
      displayName: {
        $regex: query,
        $options: "i",
      },
    })
      .sort({ displayName: 1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Family people retrieved successfully",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search family people",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};