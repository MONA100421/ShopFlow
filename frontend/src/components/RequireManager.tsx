import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

type RootStateLike = {
  auth?: {
    user?: { role?: string | null } | null;
    token?: string | null;
  };
};

export default function RequireManager() {
  const role = useSelector((s: RootStateLike) =>
    String(s.auth?.user?.role || "").toLowerCase()
  );
  const token = useSelector((s: RootStateLike) => s.auth?.token);

  const isManager = role === "admin" || role === "manager";

  if (!token) return <Navigate to="/signin" replace />;
  if (!isManager) return <Navigate to="/products" replace />;

  return <Outlet />;
}
