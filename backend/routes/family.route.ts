import { Router } from "express";
import multer from "multer";

import {
  getFamilyTree,
  searchFamilyPeople,
  getAllPersons,
  createPerson,
  updatePerson,
  deletePerson,
  importGrampsFile,
  searchFamilyPlaces,
  createFamilyPlace,
  getFamilyPlaceOptions,
  createSimpleFamilyPlace,
  getAllPlaces,
  getPlaceName,
  createPlace,
  updatePlace,
  deletePlace,
} from "../controllers/family.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

router.get("/", getAllPersons);
router.get("/search", searchFamilyPeople);
router.get("/tree", getFamilyTree);

// Place routes first
router.get("/places/search", searchFamilyPlaces);
router.get("/places/options", getFamilyPlaceOptions);
router.get("/places/:placeId", getPlaceName);

router.post("/places", createFamilyPlace);
router.post("/places/simple", createSimpleFamilyPlace);

router.get("/place", getAllPlaces);
router.post("/place", createPlace);
router.post("/place/:placeId", updatePlace);
router.delete("/place/:placeId", deletePlace);

router.post(
  "/import/gramps",
  upload.single("grampsFile"),
  importGrampsFile
);

// Generic person routes last
router.post("/", createPerson);
router.post("/:grampsId", updatePerson);
router.delete("/:grampsId", deletePerson);

// Future:
// router.get("/export/gramps", exportGrampsFile);

export default router;