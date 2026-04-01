// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import { UserDocument } from "../types/user.js";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  console.log("req.auth:", req.auth);
  const clerkUserId = req.auth?.userId;
  console.log("Clerk User ID:", clerkUserId);
  if (!clerkUserId) {
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ clerkUserId }) as UserDocument | null;
  if (!user) {
    return res.status(404).json("User not found!");
  }

  req.currentUser = user;

  next();
};