import { useDispatch, useSelector } from "react-redux";
import { signin, signup, clearAuthError } from "../redux/slices/authSlice";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./AuthForm.css";

export default function AuthForm({ mode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isSignIn = mode === "signin";

  // ✅ 从 Redux 读取 auth 状态（替代本地 state）
  const { loading, error } = useSelector((s) => s.auth);

  // ✅ 仍然是“表单本地状态”（这是正常的，不属于 auth）
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // ✅ 标题逻辑保持不变
  const title = useMemo(() => {
    if (mode === "signin") return "Sign in to your account";
    if (mode === "signup") return "Sign up an account";
    if (mode === "update") return "Update password";
    return "Auth";
  }, [mode]);

  // ✅ 切换 signin / signup 时清空 Redux 里的 error
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, mode]);

  // ✅ Redux 版登录（user / manager）
  async function doLogin(wantRole) {
    try {
      const result = await dispatch(
        signin({ email: email.trim(), password })
      ).unwrap();

      // 如果后端返回 user.role
      const role = String(result?.user?.role || "").toLowerCase();

      if (wantRole === "manager") {
        if (role !== "admin" && role !== "manager") {
          throw new Error(`This account is not admin/manager (role=${role})`);
        }
      }

      // 登录成功 → 去 products
      navigate("/products");
    } catch (err) {
      // ❗什么都不用写
      // error 已经被 authSlice 写进 redux state.auth.error
    }
  }

  // ✅ Redux 版注册（如果你有 signup 页面）
  async function doSignup() {
    try {
      await dispatch(
        signup({ email: email.trim(), password })
      ).unwrap();

      navigate("/products");
    } catch (err) {
      // 同上，error 已在 redux
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

          {/* ✅ Redux error */}
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
            <button
              className="btn btn-primary auth-primary"
              type="button"
              disabled={loading}
              onClick={doSignup}
            >
              {loading
                ? "Submitting..."
                : mode === "signup"
                  ? "Sign up"
                  : "Update"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
