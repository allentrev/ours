import { Router } from "express";
import multer from "multer";
import type {} from "multer";

import { requireAuth, requireAdmin } from "../middlewares/auth.js";

import {
  getFamilyTree,
  searchFamilyPeople,
  importGrampsFile,
  searchFamilyPlaces,

  getAllPersons,
  createPerson,
  readPerson,
  updatePerson,
  deletePerson,
    
  getAllFamilies,
  createFamily,
  readFamily,
  updateFamily,
  deleteFamily,
  
  getAllPlaces,
  createPlace,
  readPlace,
  updatePlace,
  deletePlace,
  getPlaceName,

  createFamilyPlace,
  getFamilyPlaceOptions,
  createSimpleFamilyPlace,

  getAllNotes,
  createNote,
  readNote,
  updateNote,
  deleteNote,
} from "../controllers/family.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});
router.get("/search", searchFamilyPeople);
router.get("/tree", getFamilyTree);

// Place routes first
router.get("/places/search", searchFamilyPlaces);
router.get("/places/options", getFamilyPlaceOptions);
router.get("/places/:placeId", getPlaceName);

router.post("/places", createFamilyPlace);
router.post("/places/simple", createSimpleFamilyPlace);

router.get("/place", getAllPlaces);
router.post("/place", requireAuth, createPlace);
router.get("/place/:placeId", readPlace);
router.post("/place/:placeId", requireAuth, updatePlace);
router.delete("/place/:placeId", requireAuth, deletePlace);

router.get("/family", getAllFamilies);
router.post("/family", requireAuth, createFamily);
router.get("/family/:familyId", readFamily);
router.post("/family/:familyId", requireAuth, updateFamily);
router.delete("/family/:familyId", requireAuth, deleteFamily);

router.get("/note", getAllNotes);
router.post("/note", requireAuth, createNote);
router.get("/note/:noteId", readNote);
router.post("/note/:noteId", requireAuth, updateNote);
router.delete("/note/:noteId", requireAuth, deleteNote);

router.post(
  "/import/gramps",
  upload.single("grampsFile"),
  importGrampsFile
);

// Generic person routes last
router.get("/person", getAllPersons);
router.post("/person", requireAuth, createPerson);
router.get("/person/:personId", readPerson);
router.post("/person/:personId", requireAuth, updatePerson);
router.delete("/person/:personId", requireAuth, deletePerson);

// Future:
// router.get("/export/gramps", exportGrampsFile);

export default router;