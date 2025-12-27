import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForm.css";

export default function AuthForm({ mode }) {
  const isSignIn = mode === "signin";

  const title = useMemo(() => {
    if (mode === "signin") return "Sign in to your account";
    if (mode === "signup") return "Sign up an account";
    if (mode === "update") return "Update password";
    return "Auth";
  }, [mode]);

  const [email, setEmail] = useState("you@example.com");
  const [password, setPassword] = useState("12345678");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError =
    touched.email && !email.includes("@") ? "Invalid Email input!" : "";

  const passwordError =
    touched.password && password.length < 6 ? "Invalid Password input!" : "";

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email.includes("@")) return;
    if (password.length < 6) return;
    alert("Submitted ✅ (backend comes next)");
  }

  return (
    <div className="auth-card">
      <button className="auth-close" aria-label="close">
        ×
      </button>

      <h1 className="auth-title">{title}</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <div className="field-label">Email</div>
          <div className="field-row">
            <input
              className={`input ${emailError ? "error" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@example.com"
              type="email"
            />
          </div>
          {emailError && <div className="error-text">{emailError}</div>}
        </div>

        <div className="field">
          <div className="field-label">Password</div>
          <div className="field-row">
            <input
              className={`input ${passwordError ? "error" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="********"
              type={showPw ? "text" : "password"}
            />
            <button
              type="button"
              className="inline-action"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && <div className="error-text">{passwordError}</div>}
        </div>

        <button className="primary-btn" type="submit">
          {mode === "signin" ? "Sign In" : "Submit"}
        </button>
      </form>

      {isSignIn && (
        <div className="bottom-row">
          <span>
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </span>
          <Link to="/update-password">Forgot password?</Link>
        </div>
      )}
    </div>
  );
}
