import "express";

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
  }
}
