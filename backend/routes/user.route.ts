import express from "express"
import { getUserSavedPosts, savePost, updateProfile,getProfile } from "../controllers/user.controller.js"
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router()

router.get("/saved", getUserSavedPosts)
router.patch("/save", savePost)
router.put("/profile", requireAuth, updateProfile);
router.get("/profile", requireAuth, getProfile);

export default router 