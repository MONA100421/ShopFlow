import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_BASE = "http://localhost:5001";

export default function AdminRoute({ children }) {
    const [status, setStatus] = useState("loading"); // loading | ok | no
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            setStatus("no");
            return;
        }

        (async () => {
            try {
                const resp = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await resp.json().catch(() => ({}));

                if (!resp.ok) return setStatus("no");
                if (data?.user?.role === "admin") return setStatus("ok");
                setStatus("no");
            } catch {
                setStatus("no");
            }
        })();
    }, [token]);

    if (status === "loading") return null; // 你也可以返回一个 Loading...
    if (status === "no") return <Navigate to="/signin" replace />;
    return children;
}
