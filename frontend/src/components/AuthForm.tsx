import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AppDispatch } from "../store/store";
import { loginThunk } from "../store/authSlice";

import "./AuthForm.css";

interface AuthFormProps {
  mode: "login" | "register" | "reset";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const titleMap = {
    login: "Sign in to your account",
    register: "Sign up an account",
    reset: "Update your password",
  };

  const buttonTextMap = {
    login: "Sign In",
    register: "Register",
    reset: "Update Password",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (mode !== "reset" && !password.trim()) {
      setError("Password is required");
      return;
    }

    setError("");

    if (mode === "reset") {
      navigate("/auth/login");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        loginThunk({
          email,
          password,
        })
      ).unwrap();

      navigate("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal">
      {/* Close button */}
      <button
        type="button"
        className="close-btn"
        onClick={() => navigate("/")}
      >
        <span className="close-icon" />
      </button>

      {/* Header */}
      <div className="sign-in-header">
        <h2 className="sign-in-title">{titleMap[mode]}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email group */}
        <div className="email-group">
          <label className="field-label">Email</label>

          <div className="form-control">
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password group */}
        {mode !== "reset" && (
          <div className="password-group">
            <label className="field-label">Password</label>

            <div className="form-control password-control">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••••••••••"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Submit button */}
        <button
          type="submit"
          className="sign-in-btn"
          disabled={loading}
        >
          <span className="sign-in-text">
            {loading ? "Please wait..." : buttonTextMap[mode]}
          </span>
        </button>
      </form>

      {/* Footer links */}
      {mode === "login" && (
        <div className="auth-links">
          <div className="signup-link">
            <span className="signup-text">
              Don’t have an account?
            </span>
            <span
              className="link"
              onClick={() => navigate("/auth/register")}
            >
              Sign up
            </span>
          </div>

          <span
            className="link forgot-password"
            onClick={() => navigate("/auth/reset")}
          >
            Forgot password?
          </span>
        </div>
      )}
    </div>
  );
}
