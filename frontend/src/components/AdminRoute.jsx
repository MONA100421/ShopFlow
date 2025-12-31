import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function AdminRoute({ children }) {
    const [status, setStatus] = useState("loading"); // loading | ok | no
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return setStatus("no");

        (async () => {
            try {
                const resp = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await resp.json().catch(() => ({}));
                if (!resp.ok) return setStatus("no");

                const role = String(data?.user?.role || "").toLowerCase();
                if (role === "admin" || role === "manager") return setStatus("ok");

                
                setStatus("no");
            } catch {
                setStatus("no");
            }
        })();
    }, [token]);

    if (status === "loading") return null;
    if (status === "no") return <Navigate to="/signin" replace />;
    return children;
}
