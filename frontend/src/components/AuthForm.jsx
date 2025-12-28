import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthForm.css";

const API_BASE = "http://localhost:5001";

export default function AuthForm({ mode }) {
  const isSignIn = mode === "signin";
  const isSignUp = mode === "signup";
  const isUpdate = mode === "update";

  const title = useMemo(() => {
    if (mode === "signin") return "Sign in to your account";
    if (mode === "signup") return "Sign up an account";
    if (mode === "update") return "Update password";
    return "Auth";
  }, [mode]);

  const navigate = useNavigate();

  const [email, setEmail] = useState("you@example.com");
  const [password, setPassword] = useState("12345678");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const emailError =
    touched.email && !email.includes("@") ? "Invalid Email input!" : "";

  const passwordError =
    touched.password && password.length < 6 ? "Invalid Password input!" : "";

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setTouched({ email: true, password: true });

    if (!email.includes("@")) return;
    if (password.length < 6) return;

    if (isUpdate) {
      setServerError("Update password is not implemented yet.");
      return;
    }

    const endpoint = isSignIn
      ? `${API_BASE}/api/auth/login`
      : `${API_BASE}/api/auth/register`;

    try {
      setLoading(true);

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setServerError(data?.message || "Request failed");
        return;
      }

      // ✅ 注册成功：提示并跳转到 signin 页面
      if (isSignUp) {
        alert("Registered ✅ Now please sign in.");
        navigate("/signin", { replace: true });
        return;
      }

      // ✅ 登录成功：保存 token
      if (!data?.token) {
        setServerError("Login succeeded but token is missing.");
        return;
      }

      localStorage.setItem("token", data.token);

      // ✅ 立刻调 /me 验证 token 真能用（也方便你 debug）
      const meResp = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const meData = await meResp.json().catch(() => ({}));

      if (!meResp.ok) {
        setServerError(meData?.message || "Token validation failed");
        localStorage.removeItem("token");
        return;
      }

     alert(`Signed in ✅ Hello ${meData?.user?.email || "user"}`);
     navigate("/", { replace: true });
     window.location.reload();


    } catch (err) {
      setServerError(
        "Network error. Check backend is running on http://localhost:5001"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <button
        className="auth-close"
        aria-label="close"
        type="button"
        onClick={() => navigate(-1)}
      >
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
              autoComplete="email"
              disabled={loading}
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
              autoComplete={isSignIn ? "current-password" : "new-password"}
              disabled={loading}
            />
            <button
              type="button"
              className="inline-action"
              onClick={() => setShowPw((v) => !v)}
              disabled={loading}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && <div className="error-text">{passwordError}</div>}
        </div>

        {serverError && <div className="error-text">{serverError}</div>}

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Submit"}
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
