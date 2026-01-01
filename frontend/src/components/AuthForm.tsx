import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AppDispatch } from "../store/store";
import { loginThunk, registerThunk } from "../store/authSlice";

import "./AuthForm.css";

interface AuthFormProps {
  mode: "login" | "register" | "reset";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  /* =========================
     State
  ========================= */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* =========================
     Reset on mode change
  ========================= */

  useEffect(() => {
    setEmail("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
    setFormError("");
    setShowPassword(false);
  }, [mode]);

  /* =========================
     Validation
  ========================= */

  const validateEmail = (value: string) =>
    value.includes("@") ? "" : "Invalid email input!";

  const validatePassword = (value: string) =>
    value.length >= 6 ? "" : "Invalid password input!";

  /* =========================
     Submit
  ========================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) return;

    try {
      setLoading(true);

      if (mode === "register") {
        await dispatch(registerThunk({ email, password })).unwrap();
      } else {
        await dispatch(loginThunk({ email, password })).unwrap();
      }

      navigate("/");
    } catch {
      setFormError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal">
      <button
        className="close-btn"
        onClick={() => {
          setFormError("");
          navigate("/");
        }}
      >
        <span className="close-icon" />
      </button>

      <div className="sign-in-header">
        <h2 className="sign-in-title">
          {mode === "register"
            ? "Sign up an account"
            : "Sign in to your account"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className={`email-group ${emailError ? "has-error" : ""}`}>
          <label className="field-label">Email</label>
          <div className={`form-control ${emailError ? "error" : ""}`}>
            <input
              className="form-input"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                if (mode === "register") {
                  setEmailError(validateEmail(e.target.value));
                }
              }}
            />
          </div>
          {emailError && <span className="field-error">{emailError}</span>}
        </div>

        {/* Password */}
        <div className={`password-group ${passwordError ? "has-error" : ""}`}>
          <label className="field-label">Password</label>
          <div
            className={`form-control password-control ${
              passwordError ? "error" : ""
            }`}
          >
            <input
              className="form-input"
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              onChange={(e) => {
                setPassword(e.target.value);
                if (mode === "register") {
                  setPasswordError(validatePassword(e.target.value));
                }
              }}
            />

            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && (
            <span className="field-error">{passwordError}</span>
          )}
        </div>

        {formError && <div className="auth-error">{formError}</div>}

        <button className="sign-in-btn" disabled={loading}>
          {mode === "register" ? "Create account" : "Sign In"}
        </button>
      </form>

      <div className="auth-links">
        {mode === "register" ? (
          <div className="signup-link">
            <span className="signup-text">Already have an account</span>
            <span className="link" onClick={() => navigate("/auth/login")}>
              Sign in
            </span>
          </div>
        ) : (
          <>
            <div className="signup-link">
              <span className="signup-text">Don’t have an account?</span>
              <span
                className="link"
                onClick={() => navigate("/auth/register")}
              >
                Sign up
              </span>
            </div>
            <span className="link">Forgot password?</span>
          </>
        )}
      </div>
    </div>
  );
}
