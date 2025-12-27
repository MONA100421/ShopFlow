import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthForm({ mode }: { mode: "login" | "register" | "reset" }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    if (mode === "login") {
      login("user"); // 先用 user，之後會加 admin
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
