import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const SuperAdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return user?.role === "superadmin" ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default SuperAdminRoute;
