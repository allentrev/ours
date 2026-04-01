// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import { UserDocument } from "../types/user.js";
import { getAuth } from "@clerk/express";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);

  console.log("Authorization header:", req.headers.authorization);
  console.log("Clerk auth:", auth);

  const clerkUserId = auth.userId;
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