import type { Request, Response } from "express";
import type {} from "multer";

import { parseGrampsBuffer } from "../../lib/grampsParser.js";

import { importFamilyDataToMongo } from "../../services/familyImport.service.js";

const modName ="/controllers/family.controller/";

export const importGrampsFile = async (
  req: Request,
  res: Response
) => {
  try {
    console.log(`${modName} importGrampsFIle`);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Gramps file uploaded",
      });
    }

    const parsedData = parseGrampsBuffer(req.file.buffer);
    //console.log("Result of parseGrampsBuffer, parsedData", parsedData);

    const result = await importFamilyDataToMongo(
      parsedData,
      req.file.originalname
    );
    //console.log("Result of importFamilyDataToMongo, result", result);
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
