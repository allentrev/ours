import type { Request, Response } from "express";
import { importFamilyDataToMongo } from "../services/familyMongoImport.service.js";

export const importFamilyDataToMongoController = async (
  _req: Request,
  res: Response
) => {
  console.log("Mongo Import Controller");
  const result = await importFamilyDataToMongo();
  console.log("Controller result", result);
  res.json(result);
};