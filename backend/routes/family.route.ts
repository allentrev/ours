import { Router } from "express";
import multer from "multer";
import type {} from "multer";

import { requireAuth, requireAdmin } from "../middlewares/auth.js";

import * as PersonController from
    "../controllers/Family/person.controller.js";

import * as FamilyController from
    "../controllers/Family/family.controller.js";
    
import {
  getPersonConnection,
} from "../controllers/Family/personConnection.controller.js";


import * as PlaceController from
    "../controllers/Family/place.controller.js";

import * as NoteController from
    "../controllers/Family/note.controller.js";

import * as TreeController from
    "../controllers/Family/tree.controller.js";

import * as ImportController from
    "../controllers/Family/import.controller.js";


const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});
router.get("/search", TreeController.searchFamilyPeople);
router.get("/tree", TreeController.getFamilyTree);

// Place routes first
router.get("/places/search", PlaceController.searchFamilyPlaces);
router.get("/places/options", PlaceController.getFamilyPlaceOptions);
router.get("/places/:placeId", PlaceController.getPlaceName);

router.post("/places", requireAuth, PlaceController.createFamilyPlace);
router.post("/places/simple", requireAuth, PlaceController.createSimpleFamilyPlace);

router.get("/place", PlaceController.getAllPlaces);
router.post("/place", requireAuth, PlaceController.createPlace);
router.get("/place/:placeId", PlaceController.readPlace);
router.post("/place/:placeId", requireAuth, PlaceController.updatePlace);
router.delete("/place/:placeId", requireAuth, PlaceController.deletePlace);

router.get("/family", FamilyController.getAllFamilies);
router.post("/family", requireAuth, FamilyController.createFamily);
router.get("/family/:familyId", FamilyController.readFamily);
router.post("/family/:familyId", requireAuth, FamilyController.updateFamily);
router.delete("/family/:familyId", requireAuth, FamilyController.deleteFamily);

router.get("/connection", getPersonConnection);

router.get("/note", NoteController.getAllNotes);
router.post("/note", requireAuth, NoteController.createNote);
router.get("/note/:noteId", NoteController.readNote);
router.post("/note/:noteId", requireAuth, NoteController.updateNote);
router.delete("/note/:noteId", requireAuth, NoteController.deleteNote);

router.post(
  "/import/gramps",
  upload.single("grampsFile"),
  ImportController.importGrampsFile
);

// Generic person routes last
router.get("/person/:personId/relationships", PersonController.getPersonRelationships);
router.get("/person", PersonController.getAllPersons);
router.post("/person", requireAuth, PersonController.createPerson);
router.post( "/person/relationship", requireAuth, PersonController.createRelatedPerson);
router.get("/person/:personId", PersonController.readPerson);
router.post("/person/:personId", requireAuth, PersonController.updatePerson);
router.delete("/person/:personId", requireAuth, PersonController.deletePerson);


// Future:
// router.get("/export/gramps", exportGrampsFile);

export default router;