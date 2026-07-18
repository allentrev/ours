// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import { UserDocument } from "../types/user.js";
import { getAuth } from "@clerk/express";

const modName="/middlewares/auth/"

async function getCurrentUser(req: Request): Promise<{
  auth: ReturnType<typeof getAuth>;
  user: UserDocument | null;
}> {
  const auth = getAuth(req);

  // TODO: Remove this for production, it's just for debugging purposes
  //auth.debug();

  const authorization =
    req.headers.authorization;

  if (
    authorization?.startsWith(
      "Bearer "
    )
  ) {
    const token =
      authorization.slice(7);

    const [, payload] =
      token.split(".");

    if (payload) {
      const decoded =
        JSON.parse(
          Buffer.from(
            payload,
            "base64url"
          ).toString("utf8")
        );

    /*
    console.log("Clerk token diagnostics:", {
      sub: decoded.sub,
      sid: decoded.sid,
      iss: decoded.iss,
      azp: decoded.azp,
      iat: decoded.iat,
      nbf: decoded.nbf,
      exp: decoded.exp,
      now: Math.floor(Date.now() / 1000),
    });
    */
  }
}
  if (!auth.userId) {
    return {auth, user: null};
  }

  const user = await User.findOne({
    clerkUserId: auth.userId,
  }) as UserDocument | null;

  return { auth, user };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const funcName= "/middlewares/auth/requireAuth";
  //console.log(`${funcName} entry`);
  const { user } = await getCurrentUser(req);
  console.log(`${funcName} user`, user);

  if (!user) {
    return res.status(401).json("Not authenticated!");
  }

  req.currentUser = user;

  next();
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = await getCurrentUser(req);

  if (!user) {
    return res.status(401).json("Not authenticated!");
  }

  if (user.role !== "admin") {
    return res.status(403).json("Admin access required!");
  }

  req.currentUser = user;

  next();
};

//
//  Uage: requireRole("admin", "editor")  // Example usage
//
export const requireRole =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = await getCurrentUser(req);

    if (!user) {
      return res.status(401).json("Not authenticated!");
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json("Forbidden");
    }

    req.currentUser = user;

    next();
  };