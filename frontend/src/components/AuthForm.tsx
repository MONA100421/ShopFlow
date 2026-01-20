import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AppDispatch } from "../store/store";
import { loginThunk, registerThunk } from "../store/authSlice";

import emailSendIcon from "../assets/mdi_email-send-outline.svg";

import "./AuthForm.css";

type AuthMode = "login" | "register" | "reset" | "reset-success";

interface AuthFormProps {
  mode: AuthMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  /* State */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

/* Reset state on mode change */

  useEffect(() => {
    setEmail("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
    setFormError("");
    setShowPassword(false);
  }, [mode]);

  /* Validation helpers */

  const validateEmail = (value: string) => {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!value) {
      return "Email is required";
    }

    if (!EMAIL_REGEX.test(value)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const validatePassword = (value: string) =>
    value.length >= 6 ? "" : "Invalid password input!";

  /* Form submit handler */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const emailErr = validateEmail(email);
    setEmailError(emailErr);
    if (emailErr) return;

    if (mode !== "reset") {
      const passwordErr = validatePassword(password);
      setPasswordError(passwordErr);
      if (passwordErr) return;
    }

    try {
      setLoading(true);

      if (mode === "login") {
        await dispatch(loginThunk({ email, password })).unwrap();
        navigate("/");
      }

      if (mode === "register") {
        await dispatch(registerThunk({ email, password })).unwrap();
        navigate("/");
      }

      if (mode === "reset") {
        navigate("/auth/reset-success");
      }
    } catch {
      setFormError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* Reset Success Page */

  if (mode === "reset-success") {
    return (
      <div className="login-modal reset-success">
        <button
          className="close-btn"
          onClick={() => navigate("/auth/login")}
        >
          <span className="close-icon" />
        </button>

        <div className="reset-icon">
          <img
            src={emailSendIcon}
            alt="Email sent"
            width={70}
            height={70}
          />
        </div>

        <p className="reset-success-text">
          We have sent the update password link to your email, please check it!
        </p>
      </div>
    );
  }

  /* Main Form */

  return (
    <div className={`login-modal ${mode === "reset" ? "reset-modal" : ""}`}>
      <button
        className="close-btn"
        onClick={() => navigate("/")}
      >
        <span className="close-icon" />
      </button>

      <div className="sign-in-header">
        <h2 className="sign-in-title">
          {mode === "reset"
            ? "Update your password"
            : mode === "register"
            ? "Sign up an account"
            : "Sign in to your account"}
        </h2>
      </div>

      {mode === "reset" && (
        <p className="reset-desc">
          Enter your email link, we will send you the recovery link
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className={`email-group ${emailError ? "has-error" : ""}`}>
          <label className="field-label" htmlFor="auth-email">Email</label>
          <div className={`form-control ${emailError ? "error" : ""}`}>
            <input
              id="auth-email"
              name="email"
              className="form-input"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                if (mode !== "login") {
                  setEmailError(validateEmail(value));
                }
              }}
            />
          </div>
          {emailError && <span className="field-error">{emailError}</span>}
        </div>

        {/* Password */}
        {mode !== "reset" && (
          <div className={`password-group ${passwordError ? "has-error" : ""}`}>
            <label className="field-label" htmlFor="auth-email">Password</label>
            <div
              className={`form-control password-control ${
                passwordError ? "error" : ""
              }`}
            >
              <input
                className="form-input"
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  if (mode === "register") {
                    setPasswordError(validatePassword(value));
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
        )}

        {formError && <div className="auth-error">{formError}</div>}

        <button className="sign-in-btn" disabled={loading}>
          {mode === "reset"
            ? "Update password"
            : mode === "register"
            ? "Create account"
            : "Sign In"}
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
        ) : mode === "login" ? (
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
            <span
              className="link"
              onClick={() => navigate("/auth/reset")}
            >
              Forgot password?
            </span>
          </>
        ) : (
          <div className="signup-link">
            <span className="signup-text">Back to</span>
            <span className="link" onClick={() => navigate("/auth/login")}>
              Sign in
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
