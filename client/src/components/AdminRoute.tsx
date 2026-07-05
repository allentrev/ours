import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { isAdminUser } from "../utilities/authRoles";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isLoaded, user } = useUser();

  if (!isLoaded) return null;

  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;