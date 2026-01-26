import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Navigate, Outlet } from "react-router-dom";

export default function RequireAdmin() {
  const { isAuthenticated, user, initialized } = useSelector(
    (state: RootState) => state.auth
  );

  if (!initialized) {
    return <p>Loading...</p>;
  }


  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
