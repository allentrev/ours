import express from "express";
import { importFamilyDataToMongoController } from "../controllers/familyMongoImport.controller.js";

const router = express.Router();
console.log("Mongo Import Route");

router.post("/", importFamilyDataToMongoController);

export default router;