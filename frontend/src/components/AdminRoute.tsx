import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config";
import type { ReactNode } from "react";

type Status = "loading" | "ok" | "no";

type AdminRouteProps = {
  children: ReactNode;
};

function getRoleFromJwt(token: string | null): string {
  if (!token) return "";
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return "";
    // JWT payload is base64url; atob generally works for normal base64,
    // but many tokens are compatible enough. We keep it simple & safe.
    const payload = JSON.parse(atob(parts[1]));
    return String(payload?.role || "").toLowerCase();
  } catch {
    return "";
  }
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const token = localStorage.getItem("token");

  // ✅ 1) 快速本地判定：先不依赖后端 /me，避免“点了没反应”
  const localOk = useMemo(() => {
    const role = getRoleFromJwt(token);
    return role === "admin" || role === "manager";
  }, [token]);

  // ✅ 2) 初始状态：如果本地能判断 ok，就直接 ok；否则 loading 再去问后端
  const [status, setStatus] = useState<Status>(() => {
    if (!token) return "no";
    return localOk ? "ok" : "loading";
  });

  useEffect(() => {
    // token 变了，先同步一次状态
    if (!token) {
      setStatus("no");
      return;
    }
    if (localOk) {
      // 本地已 ok，就先放行，不阻塞 UI
      setStatus("ok");
    } else {
      setStatus("loading");
    }

    // ✅ 3) 仍然向后端验证（兜底安全），但不再让 UI 卡死
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data: any = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          // 如果本地都不 ok，那就拒绝
          if (!localOk) setStatus("no");
          return;
        }

        const role = String(data?.user?.role || "").toLowerCase();
        const ok = role === "admin" || role === "manager";

        setStatus(ok ? "ok" : "no");
      } catch {
        // 网络失败：本地 ok 就继续放行；本地不 ok 才拒绝
        if (!localOk) setStatus("no");
      }
    })();
  }, [token, localOk]);

  // ✅ 关键：不要再 return null 造成“点击没反应”
  // 如果本地 ok，直接渲染 children（已在初始状态处理）
  if (status === "no") return <Navigate to="/signin" replace />;

  // loading 时给一个极轻的占位，不改变布局（也可以换成 null，但你会觉得没反应）
  if (status === "loading")
    return <div style={{ padding: 16, opacity: 0.7 }}>Loading...</div>;

  return <>{children}</>;
}
