import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config";
import type { ReactNode } from "react";

type Status = "loading" | "ok" | "no";

type AdminRouteProps = {
    children: ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
    const [status, setStatus] = useState<Status>("loading");
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

                const data: any = await resp.json().catch(() => ({}));
                if (!resp.ok) {
                    setStatus("no");
                    return;
                }

                const role = String(data?.user?.role || "").toLowerCase();
                if (role === "admin" || role === "manager") {
                    setStatus("ok");
                    return;
                }

                setStatus("no");
            } catch {
                setStatus("no");
            }
        })();
    }, [token]);

    if (status === "loading") return null;
    if (status === "no") return <Navigate to="/signin" replace />;
    return <>{children}</>;
}
