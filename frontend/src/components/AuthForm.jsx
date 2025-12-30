import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import "./AuthForm.css";

export default function AuthForm({ mode }) {
  const navigate = useNavigate();
  const isSignIn = mode === "signin";

  const title = useMemo(() => {
    if (mode === "signin") return "Sign in to your account";
    if (mode === "signup") return "Sign up an account";
    if (mode === "update") return "Update password";
    return "Auth";
  }, [mode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * 真正的登录逻辑（user / manager）
   */
  async function doLogin(wantRole) {
    setError("");
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.message || "Login failed");

      const token = data?.token;
      if (!token) throw new Error("No token returned from server");

      // ✅ 存 token
      localStorage.setItem("token", token);

      // ✅ ====== HERE：把 role 存起来（给 ProductsList 的 isManager() 用）======
      const role = String(data?.user?.role || "").toLowerCase();
      localStorage.setItem("role", role);
      // ✅ =====================================================================

      // ✅ 跳转逻辑（不要让 manager 去 /add-product；去 /products 才能看到 Edit）
      if (wantRole === "manager") {
        // 允许 admin/manager
        if (role !== "admin" && role !== "manager") {
          // 可选：如果你希望“manager按钮只能manager账号登录”，就保留这个检查
          throw new Error(`This account is not admin/manager (role=${role})`);
        }
        navigate("/products"); // ✅ manager 登录后先去 products（看见 Edit / Add Product）
      } else {
        navigate("/products"); // user 也去 products
      }
    } catch (err) {
      setError(err?.message || "Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <h1 className="auth-title">{title}</h1>

        <div className="auth-form">
          <div className="auth-field">
            <div className="auth-label">Email</div>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <div className="auth-label">Password</div>
            <div className="auth-pw-row">
              <input
                className="input"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignIn ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="btn"
                onClick={() => setShowPw((s) => !s)}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: "#dc2626", marginBottom: 8 }}>{error}</div>
          )}

          {isSignIn ? (
            <div className="auth-btn-row">
              <button
                type="button"
                className="btn btn-primary auth-primary"
                disabled={loading}
                onClick={() => doLogin("user")}
              >
                {loading ? "Signing in..." : "Login as User"}
              </button>

              <button
                type="button"
                className="btn btn-primary auth-primary"
                disabled={loading}
                onClick={() => doLogin("manager")}
              >
                {loading ? "Signing in..." : "Login as Manager"}
              </button>

              <div className="auth-bottom">
                <span>
                  Don’t have an account?{" "}
                  <Link className="auth-link" to="/signup">
                    Sign up
                  </Link>
                </span>
                <Link className="auth-link" to="/update-password">
                  Forgot password?
                </Link>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary auth-primary" type="button">
              {mode === "signup" ? "Sign up" : "Update"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
