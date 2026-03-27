import "express";
import { UserDocument } from "./user.ts";

declare module "express-serve-static-core" {
  interface Request {
    auth?: {
      userId?: string;
      sessionClaims?: {
        metadata?: {
          role?: string;
        };
      };
    };
    currentUser?: UserDocument;
  }
}
