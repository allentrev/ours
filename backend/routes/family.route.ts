import { Router } from "express";
import {
  getFamilyTree,
  searchFamilyPeople,
} from "../controllers/family.controller.js";

const router = Router();

router.get("/tree", getFamilyTree);
router.get("/search", searchFamilyPeople);

export default router;