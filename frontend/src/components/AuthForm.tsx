import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { signin, signup, clearAuthError } from "../redux/slices/authSlice";
import type { AppDispatch, RootState } from "../redux/store";

import "./AuthForm.css";

type Props = {
  mode: "signin" | "signup" | "update";
};

export default function AuthForm({ mode }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();

  const token = useSelector((s: RootState) => s.auth.token);
  const authError = useSelector((s: RootState) => s.auth.error);
  const authLoading = useSelector((s: RootState) => s.auth.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // 登录成功后自动跳转
  useEffect(() => {
    if (mode === "signin" && token) {
      nav("/products", { replace: true });
    }
  }, [token, mode, nav]);

  // 组件卸载时清理错误
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const emailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const emailError =
    touched.email && !email
      ? "Email is required"
      : touched.email && !emailValid
      ? "Invalid email address"
      : "";

  const passwordError =
    touched.password && password.length < 6
      ? "Password must be at least 6 characters"
      : "";

  const canSubmit = !emailError && !passwordError && email && password;

  // ✅ 唯一的 submitSignin（不再重复声明）
  const submitSignin = async () => {
    setTouched({ email: true, password: true });
    dispatch(clearAuthError());

    if (!canSubmit) return;

    try {
      await dispatch(signin({ email, password })).unwrap();
      nav("/products", { replace: true });
    } catch (err) {
      console.error("signin failed", err);
    }
  };

  const submitSignup = async () => {
    setTouched({ email: true, password: true });
    dispatch(clearAuthError());

    if (!canSubmit) return;

    try {
      await dispatch(signup({ email, password })).unwrap();
      nav("/signin", { replace: true });
    } catch (err) {
      console.error("signup failed", err);
    }
  };

  const title =
    mode === "signup"
      ? "Sign up an account"
      : mode === "update"
      ? "Update password"
      : "Sign in to your account";

const close = () => {
  if (window.history.length > 1) nav(-1);
  else nav("/products", { replace: true });
};

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{title}</h2>

        {/* EMAIL */}
        <div className="field">
          <label>Email</label>
          <input
            className={`input ${emailError ? "input-error" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
          {emailError && <div className="field-error">{emailError}</div>}
        </div>

        {/* PASSWORD */}
        <div className="field">
          <label>Password</label>
          <div className="pw-row">
            <input
              type={showPwd ? "text" : "password"}
              className={`input ${passwordError ? "input-error" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            />
            <button
              type="button"
              className="show-btn"
              onClick={() => setShowPwd((v) => !v)}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && <div className="field-error">{passwordError}</div>}
        </div>

        {/* 后端错误 */}
        {authError && <div className="field-error">{String(authError)}</div>}

        {/* ACTION BUTTONS */}
        {mode === "signin" && (
          <div className="auth-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={authLoading}
              onClick={submitSignin}
            >
              Sign in
            </button>

            <button
              type="button"
              className="btn-primary"
              disabled={authLoading}
              onClick={submitSignin}
              title="Access depends on your server-side role"
            >
              Sign in (Manager)
            </button>
          </div>
        )}

        {mode === "signup" && (
          <div className="auth-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={authLoading}
              onClick={submitSignup}
            >
              Create account
            </button>
          </div>
        )}
        {mode === "signin" && (
          <div className="switch-auth-row">
            <span>
              Don’t have an account? <Link to="/signup">Sign up</Link>
            </span>

            <Link to="/update" className="forgot-link">
              Forgot password?
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
