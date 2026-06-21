import { Router } from "express";
import multer from "multer";

import {
  getFamilyTree,
  searchFamilyPeople,
  importGrampsFile,
} from "../controllers/family.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

router.get("/tree", getFamilyTree);

router.get("/search", searchFamilyPeople);

router.post(
  "/import/gramps",
  upload.single("grampsFile"),
  importGrampsFile
);

// Future:
// router.get("/export/gramps", exportGrampsFile);

export default router;