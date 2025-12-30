import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RequireManager() {
    const role = useSelector((s) => String(s.auth?.user?.role || "").toLowerCase());
    const token = useSelector((s) => s.auth?.token);

    const isManager = role === "admin" || role === "manager";

    // 没登录：送去 signin（也可以送 /products，看你老师要求）
    if (!token) return <Navigate to="/signin" replace />;

    // 已登录但不是 manager：不让进
    if (!isManager) return <Navigate to="/products" replace />;

    return <Outlet />;
}
