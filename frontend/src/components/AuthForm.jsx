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

  // 你可以保留这个状态（方便你未来在 UI 上显示当前选择）
  const [loginRole, setLoginRole] = useState("user");

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

  // ✅ 支持两种调用方式：
  // 1) form submit: handleSubmit(e)
  // 2) button click: handleSubmit(e, "admin") / handleSubmit(e, "user")
  async function handleSubmit(e, roleOverride) {
    e?.preventDefault?.(); // ✅ 兼容没有 event 的情况（不过我们下面按钮会传 e）

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

    // ✅ 本次点击选择的角色（不依赖 setState 的异步更新）
    const chosenRole = roleOverride || loginRole || "user";

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

      // ✅ 调 /me 获取真实 user（含 role）
      const meResp = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const meData = await meResp.json().catch(() => ({}));

      // ✅ 先确认 /me 成功
      if (!meResp.ok) {
        setServerError(meData?.message || "Token validation failed");
        localStorage.removeItem("token");
        return;
      }

      // ✅ 再做 role mismatch 校验
      const actualRole = meData?.user?.role;

      // ✅【改动 1】Debug：马上看出是谁不对
      console.log("chosenRole =", chosenRole, "actualRole =", actualRole);

      if (actualRole && actualRole !== chosenRole) {
        setServerError("Role mismatch. Please use the correct login button.");
        localStorage.removeItem("token");
        return;
      }

      alert(`Signed in ✅ Hello ${meData?.user?.email || "user"}`);

      // ✅【改动 2】按 role 跳转：admin 去创建商品页
      if (actualRole === "admin") {
        navigate("/add-product", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

      // 不建议强制 reload；如果你暂时依赖它可以打开
      // window.location.reload();
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

        {/* ✅ SignIn：两个按钮；非 SignIn：一个 Submit */}
        {isSignIn ? (
          <div className="two-btn-row">
            <button
              className="primary-btn"
              type="button"
              disabled={loading}
              onClick={(e) => {
                setLoginRole("user");
                handleSubmit(e, "user");
              }}
            >
              {loading ? "Loading..." : "Login as User"}
            </button>

            <button
              className="primary-btn"
              type="button"
              disabled={loading}
              onClick={(e) => {
                setLoginRole("admin");
                handleSubmit(e, "admin");
              }}
            >
              {loading ? "Loading..." : "Login as Manager"}
            </button>
          </div>
        ) : (
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Submit"}
          </button>
        )}
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
