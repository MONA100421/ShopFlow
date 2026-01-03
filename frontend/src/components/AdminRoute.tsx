// frontend/src/components/AdminRoute.tsx
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { API_BASE } from "../config";

type Status = "loading" | "ok" | "no";

type AdminRouteProps = {
  children: ReactNode;
};

/** 统一读取并清洗 token */
function getCleanToken(): string {
  const raw = localStorage.getItem("token") || "";
  return raw
    .replace(/^Bearer\s+/i, "")
    .trim()
    .replace(/^"(.+)"$/, "$1");
}

/** 从 JWT payload 里取 role（仅作乐观判断） */
function getRoleFromJwt(token: string): string {
  try {
    const [, payload] = token.split(".");
    if (!payload) return "";
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64));
    return String(json?.role || "").toLowerCase();
  } catch {
    return "";
  }
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [token, setToken] = useState<string>(() => getCleanToken());
  const [status, setStatus] = useState<Status>("loading");

  /** 同步 token（支持同 tab / 跨 tab） */
  useEffect(() => {
    const sync = () => setToken(getCleanToken());
    sync();
    window.addEventListener("storage", sync);
    const t = window.setInterval(sync, 500);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(t);
    };
  }, []);

  /** 本地 role 乐观判断（只用于“别卡住 UI”） */
  const localOk = useMemo(() => {
    if (!token) return false;
    const role = getRoleFromJwt(token);
    return role === "admin" || role === "manager";
  }, [token]);

  useEffect(() => {
    // ① 没 token：直接拒绝
    if (!token) {
      setStatus("no");
      return;
    }

    // ② 先乐观放行，避免“点了没反应”
    if (localOk) setStatus("ok");
    else setStatus("loading");

    // ③ 后端兜底校验（但绝不在这里 logout）
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ❗关键点：401 不立刻踢人，只在确认角色不符时拒绝
        if (!resp.ok) {
          // 如果本地判断 OK，就继续放行（防止误杀）
          if (localOk) return;
          setStatus("no");
          return;
        }

        const data = await resp.json().catch(() => ({}));
        const role = String(data?.user?.role || "").toLowerCase();
        const ok = role === "admin" || role === "manager";
        setStatus(ok ? "ok" : "no");
      } catch {
        // 网络异常：只要本地 OK，就不踢
        if (!localOk) setStatus("no");
      }
    })();
  }, [token, localOk]);

  if (status === "loading") {
    return (
      <div style={{ padding: 16, opacity: 0.7 }}>Checking permission…</div>
    );
  }

  if (status === "no") {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
