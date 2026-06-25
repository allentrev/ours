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

router.post("/", createPerson);
router.post("/:grampsId", updatePerson);
router.delete("/:grampsId", deletePerson);

router.get("/places/search", searchFamilyPlaces);
router.post("/places", createFamilyPlace);
router.post("/places/simple", createSimpleFamilyPlace);
router.get("/places/options", getFamilyPlaceOptions);
router.get("/place", getAllPlaces);
router.post("/place", createPlace);
router.post("/place/:grampsId", updatePlace);
router.delete("/place/:grampsId", deletePlace);

router.post(
  "/import/gramps",
  upload.single("grampsFile"),
  importGrampsFile
);

// Future:
// router.get("/export/gramps", exportGrampsFile);

export default router;