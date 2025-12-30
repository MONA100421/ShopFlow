import { Navigate } from "react-router-dom";
import { isManager } from "../utils/auth";

export default function RequireManager({ children }) {
    if (!isManager()) return <Navigate to="/products" replace />;
    return children;
}
