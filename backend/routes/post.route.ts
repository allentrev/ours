import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  featurePost,
} from "../controllers/post.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import increaseVisit from "../middlewares/increaseVisit.js";

const router = express.Router();

console.log("Post Route");

router.get("/", getPosts);
router.get("/:slug", increaseVisit, getPost);
router.post("/", requireAuth, createPost);
router.put("/:id", requireAuth, updatePost);

router.delete("/:id", requireAuth, deletePost);
router.patch("/featured", requireAuth, featurePost);

export default router;
