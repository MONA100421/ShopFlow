import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../components/AuthForm.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  if (!token) {
    return <p>Invalid or missing reset token.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }


    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    try {
      const res = await fetch(
        "http://localhost:4000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reset password failed");
        return;
      }

      // ✅ 成功：显示成功状态并跳转登录页
      setSuccess(true);

      setTimeout(() => {
        navigate("/auth/login");
      }, 2500);

    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="login-modal reset-modal">
      <div className="sign-in-header">
        <h2 className="sign-in-title">Reset Password</h2>
      </div>

      <p className="reset-desc">
        Please enter your new password below.
      </p>

      {success ? (
        <div className="reset-success">
          <div className="reset-icon">📩</div>
          <p className="reset-success-text">
            Your password has been updated successfully.
            <br />
            Redirecting to login…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="password-group">
            <label className="field-label">New Password</label>
            <div className={`form-control ${error ? "error" : ""}`}>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
          </div>

          <div className="password-group">
            <label className="field-label">Confirm New Password</label>
            <div className={`form-control ${error ? "error" : ""}`}>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button type="submit" className="sign-in-btn">
            Update password
          </button>
        </form>
      )}
    </div>
  );
}
