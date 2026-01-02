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

  // ✅ 登录成功后自动跳转（你之前缺的就是这个）
  useEffect(() => {
    if (mode === "signin" && token) {
      nav("/products", { replace: true });
    }
  }, [token, mode, nav]);

  // 清错误：输入时/切换页时更友好
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

  const submitSignin = async (role: "user" | "manager") => {
    setTouched({ email: true, password: true });
    dispatch(clearAuthError());

    if (!canSubmit) return;

    // ✅ 关键：unwrap 才能 catch 到 rejected（否则你觉得“没反应”）
    try {
      await (dispatch(signin({ email, password, role }) as any).unwrap?.() ??
        dispatch(signin({ email, password, role }) as any));
      // 跳转在 useEffect(token) 里统一做
    } catch (e) {
      // error 已经进 redux 了，这里不用再做
      console.error(e);
    }
  };

  const submitSignup = async () => {
    setTouched({ email: true, password: true });
    dispatch(clearAuthError());

    if (!canSubmit) return;

    try {
      await (dispatch(signup({ email, password }) as any).unwrap?.() ??
        dispatch(signup({ email, password }) as any));
      // 注册成功后去登录页
      nav("/signin", { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  const title =
    mode === "signup"
      ? "Sign up an account"
      : mode === "update"
      ? "Update password"
      : "Sign in to your account";

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

        {/* ✅ 后端/登录错误提示（红字） */}
        {authError && <div className="field-error">{String(authError)}</div>}

        {/* ACTION BUTTONS */}
        {mode === "signin" && (
          <div className="auth-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={authLoading}
              onClick={() => submitSignin("user")}
            >
              Sign in as User
            </button>

            <button
              type="button"
              className="btn-primary"
              disabled={authLoading}
              onClick={() => submitSignin("manager")}
            >
              Sign in as Manager
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
          <div className="switch-auth">
            New here? <Link to="/signup">Create an account</Link>
          </div>
        )}

        {mode === "signup" && (
          <div className="switch-auth">
            Already have an account? <Link to="/signin">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
