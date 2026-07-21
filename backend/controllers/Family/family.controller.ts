import type { Request, Response } from "express";
import type {} from "multer";

import { FamilyModel } from "../../models/Family/family.model.js";
import {
  readFamilyService,
} from "../../services/readFamily.service.js";

import { 
  generateHandle,
  generateLocalFamilyId,
} from "../../lib/familyIdGenerator.js";

import type {
  FamilyRecord,
  FamilyDocument,
} from "../../types/family.types.js"

const modName ="/controllers/family.controller/";

export const getAllFamilies = async (req: Request, res: Response) => {
    try {
        //console.log("family.controller, getAllFamilies");
        const families = await FamilyModel.find().lean<FamilyRecord[]>();
        res.status(200).json(families);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch families", error });
    }
};
//TODO: update API wrapper as per updateFamily
export const createFamily = async (
    req: Request<{}, {}, Partial<FamilyDocument>>,
    res: Response
) => {
    const handle = generateHandle();
    const localId = generateLocalFamilyId();
    const origin="local";

    try {
      const clerkUserId = req.currentUser?.clerkUserId;
      if (!clerkUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated user is unavailable.",
        });
      }

      console.log("family.controller, createFamily", req.body);
      const newFamily = new FamilyModel(req.body);
      newFamily.handle = handle;
      newFamily.grampsId = localId;
      newFamily.localId = localId;
      newFamily.origin = origin;
      newFamily.createdByUserId = clerkUserId;
      newFamily.updatedByUserId = clerkUserId;
      const savedFamily = await newFamily.save();
      console.log("Family created");
      res.status(201).json(savedFamily);
    } catch (error) {
      console.error("Family Save Failed:", error);
      res.status(500).json({ message: "Error creating Family", error });
    }
};

export const readFamily = async (
  req: Request<{ familyId: string }>,
  res: Response
) => {
  const funcName = "readFamily";

  try {
    const data = await readFamilyService(
      req.params.familyId
    );

    return res.status(200).json({
      success: true,
      message:
        "Family retrieved successfully",
      data,
    });
  } catch (error) {
    console.error(
      `${modName}${funcName}`,
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "FAMILY_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve family",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

export const updateFamily = async (
  req: Request<
    { familyId: string },
    unknown,
    Partial<FamilyRecord>
  >,
  res: Response
) => {
  const funcName = "updateFamily";

  try {
    const clerkUserId =
      req.currentUser?.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user is unavailable.",
      });
    }

    const familyHandle =
      req.params.familyId;

    /*
     * Prevent the client from changing
     * immutable or audit-controlled fields.
     */
    const {
      handle: _ignoredHandle,
      createdByUserId:
        _ignoredCreatedByUserId,
      updatedByUserId:
        _ignoredUpdatedByUserId,
      ...safeUpdate
    } = req.body;

    const updatedFamily =
      await FamilyModel.findOneAndUpdate(
        {
          handle: familyHandle,
        },
        {
          ...safeUpdate,
          updatedByUserId:
            clerkUserId,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean<FamilyRecord>();

    if (!updatedFamily) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Family updated successfully",
      data: updatedFamily,
    });
  } catch (error) {
    console.error(
      `${modName}${funcName}`,
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update family",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

export const deleteFamily = async (
    req: Request<{ familyId: string }>,
    res: Response
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

        res.status(200).json({ message: "Family has been deleted" });
    } catch (error) {
        console.error("Error deleting Family:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
