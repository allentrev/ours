import express from "express";
import {
    getAllGallery,
    getGalleryImagesByFolder,
    updateGallery,
    createGallery,
    deleteGallery,
    importFile,
} from "../controllers/gallery.controller.js";

import multer from "multer";

const router = express.Router();

console.log("Gallery Route");

const upload = multer({ dest: "tmp/" });

router.get("/", getAllGallery);
router.get("/images/:base/:folder", getGalleryImagesByFolder);
router.put("/:id", updateGallery);

router.post("/", createGallery);
router.delete("/:id", deleteGallery);
router.post("/import", upload.single("file"), importFile);

export default router;
