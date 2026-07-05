// src/utilities/authRoles.ts

import { useUser } from "@clerk/clerk-react";

type ClerkUser = ReturnType<typeof useUser>["user"];

export const getUserRole = (user: ClerkUser) =>
  (user?.publicMetadata?.role as string | undefined) ?? "visitor";

export const isAdminUser = (user: ClerkUser) =>
  getUserRole(user) === "admin";