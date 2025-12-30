import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { loginThunk } from "../store/authSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ---------- basic validation ----------
    if (!email) {
      setError("Email is required");
      return;
    }

    if (mode !== "reset" && !password) {
      setError("Password is required");
      return;
    }

    setError("");

    // ---------- reset mode ----------
    if (mode === "reset") {
      // mock reset behavior
      navigate("/auth/login");
      return;
    }

    // ---------- login / register ----------
    try {
      setLoading(true);

      await dispatch(
        loginThunk({
          email,
          password,
        })
      ).unwrap();

      // success → redirect
      navigate("/");
    } catch (err) {
      // thunk reject value 
      if (typeof err === "string") {
        setError(err);
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
      <h2 style={{ marginBottom: 16 }}>
        {mode === "login"
          ? "Sign In"
          : mode === "register"
          ? "Register"
          : "Reset Password"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        disabled={loading}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      {mode !== "reset" && (
        <input
          type="password"
          placeholder="Password"
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 12 }}
        />
      )}

      {error && (
        <p style={{ color: "red", marginBottom: 12 }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading
          ? "Please wait..."
          : mode === "login"
          ? "Sign In"
          : mode === "register"
          ? "Register"
          : "Reset"}
      </button>
    </form>
  );
}
