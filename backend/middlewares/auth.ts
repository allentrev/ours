// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import { UserDocument } from "../types/user.js";
import { getAuth } from "@clerk/express";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);

  console.log("Authorization header:", req.headers.authorization);
  console.log("Clerk auth:", auth);

  console.log("Origin:", req.headers.origin);
  console.log("Referer:", req.headers.referer);
  console.log("Host:", req.headers.host);
  console.log("X-Forwarded-Host:", req.headers["x-forwarded-host"]);
  console.log("X-Forwarded-Proto:", req.headers["x-forwarded-proto"]);

  const clerkUserId = auth.userId;
  if (!clerkUserId) {
    console.log("No Clerk user ID found in request");
    return res.status(401).json("Not authenticated!");
  }

  const user = await User.findOne({ clerkUserId }) as UserDocument | null;
  if (!user) {
    return res.status(404).json("User not found!");
  }

  req.currentUser = user;

  next();
};