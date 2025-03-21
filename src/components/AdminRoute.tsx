import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean; // ✅ Accept requireSuperAdmin
}

const AdminRoute = ({ children, requireSuperAdmin = false }: AdminRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // ✅ Check if the user has admin or superadmin role
  if (requireSuperAdmin) {
    if (user.role !== "superadmin") {
      return <Navigate to="/dashboard" />;
    }
  } else {
    if (user.role !== "admin" && user.role !== "superadmin") {
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

export default AdminRoute;
