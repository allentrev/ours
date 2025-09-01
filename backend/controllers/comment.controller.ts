import { Request, Response } from "express";

import Comment from "../models/comment.model.js";
import { CommentDocument } from "../types/comment.js";
import User from "../models/user.model.js";
import { UserDocument } from "../types/user.js";

/**
 * GET comments for a specific post
 */
export const getPostComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const comments: CommentDocument[] = await Comment.find({
      post: req.params.postId,
    })
      .populate("user", "username img")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

/**
 * POST a new comment
 */
export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const clerkUserId = req.auth?.userId;
    const postId = req.params.postId;

    if (!clerkUserId) {
      res.status(401).json("Not authenticated!");
      return;
    }

    const user = (await User.findOne({ clerkUserId })) as UserDocument | null;

    if (!user) {
      res.status(404).json("User not found");
      return;
    }

    const newComment = new Comment({
      ...req.body,
      user: user._id,
      post: postId,
    }) as CommentDocument;

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
};

/**
 * DELETE a comment
 */
export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const clerkUserId = req.auth?.userId;
    const id = req.params.id;

    if (!clerkUserId) {
      res.status(401).json("Not authenticated!");
      return;
    }

    const role = req.auth?.sessionClaims?.metadata?.role || "user";

    if (role === "admin") {
      await Comment.findByIdAndDelete(id);
      res.status(200).json("Comment has been deleted");
      return;
    }

    const user = (await User.findOne({ clerkUserId })) as UserDocument | null;

    if (!user) {
      res.status(404).json("User not found");
      return;
    }

    const deletedComment = await Comment.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!deletedComment) {
      res.status(403).json("You can delete only your comment!");
      return;
    }

    res.status(200).json("Comment deleted");
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
