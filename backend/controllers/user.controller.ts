import { Request, Response } from "express";
import User from "../models/user.model.js";
import { UserDocument } from "../types/user.js";

/**
 * Get all saved posts for the logged-in user
 */
export const getUserSavedPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      res.status(401).json("Not authenticated!");
      return;
    }

    const user = (await User.findOne({ clerkUserId })) as UserDocument | null;

    if (!user) {
      res.status(404).json("User not found");
      return;
    }

    res.status(200).json(user.savedPosts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch saved posts" });
  }
};

/**
 * Save or unsave a post for the logged-in user
 */
export const savePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const clerkUserId = req.auth?.userId;
    const postId = req.body.postId as string;

    if (!clerkUserId) {
      res.status(401).json("Not authenticated!");
      return;
    }

    const user = (await User.findOne({ clerkUserId })) as UserDocument | null;

    if (!user) {
      res.status(404).json("User not found");
      return;
    }

    const isSaved = user.savedPosts.some(
      (p: string) => p.toString() === postId
    );

    if (!isSaved) {
      await User.findByIdAndUpdate(user._id, {
        $push: { savedPosts: postId },
      });
    } else {
      await User.findByIdAndUpdate(user._id, {
        $pull: { savedPosts: postId },
      });
    }

    res.status(200).json(isSaved ? "Post unsaved" : "Post saved");
  } catch (err) {
    res.status(500).json({ error: "Failed to update saved posts" });
  }
};
