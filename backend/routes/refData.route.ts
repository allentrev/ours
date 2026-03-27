import express from "express";
import {
    getAllRefData,
    deleteRefData,
    getRefData,
    getPageRefData,
    updateRefData,
    updateAllRefData,
    createRefData,
} from "../controllers/refData.controller.js";

const router = express.Router();

console.log("RefData Route");

router.get("/", getAllRefData);
router.get("/webPage/:webPage", getPageRefData);
router.get("/refKey/:refKey/", getRefData);
router.post("/:refKey", updateRefData);
router.post("/updateMany", updateAllRefData);

router.post("/", createRefData);
router.delete("/:refKey", deleteRefData);

export default router;
