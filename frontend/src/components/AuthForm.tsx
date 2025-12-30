import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { loginSuccess } from "../store/authSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function AuthForm({ mode }: { mode: "login" | "register" | "reset" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (mode !== "reset" && !password) {
      setError("Password is required");
      return;
    }

    setError("");

    // mock login
    if (mode === "login" || mode === "register") {
      const isAdmin = email.toLowerCase().includes("admin");

      dispatch(
        loginSuccess({
          id: crypto.randomUUID(),
          role: isAdmin ? "admin" : "user",
        })
      );

      navigate("/");
    } else if (mode === "reset") {
      navigate("/auth/login");
    }
      };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{mode.toUpperCase()}</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {mode !== "reset" && (
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
