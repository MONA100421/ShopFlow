/* ========================
   Config
======================== */

// 🔁 切換 mock / real API（之後接 Express 只要改這行）
const USE_MOCK_API = true;

// 未來 Express API base
const API_BASE_URL = "/api/auth";

/* ========================
   Types
======================== */

export interface User {
  _id: string;
  email: string;
  role: "admin" | "user";
}

export interface AuthResponse {
  user: User;
  token: string;
}

/* ========================
   Mock Helpers
======================== */

async function mockDelay(ms = 800) {
  await new Promise((res) => setTimeout(res, ms));
}

function generateMockUser(email: string): User {
  return {
    _id: crypto.randomUUID(),
    email,
    role: email.toLowerCase().includes("admin") ? "admin" : "user",
  };
}

/* ========================
   Auth APIs
======================== */

export async function loginAPI(
  payload: { email: string; password: string }
): Promise<AuthResponse> {
  if (USE_MOCK_API) {
    await mockDelay();

    const { email, password } = payload;

    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    return {
      user: generateMockUser(email),
      token: "mock-jwt-token",
    };
  }

  /* ===== Real Express API ===== */
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return res.json();
}

export async function registerAPI(
  payload: { email: string; password: string }
): Promise<AuthResponse> {
  if (USE_MOCK_API) {
    await mockDelay();

    const { email, password } = payload;

    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    return {
      user: {
        _id: crypto.randomUUID(),
        email,
        role: "user",
      },
      token: "mock-register-jwt-token",
    };
  }

  /* ===== Real Express API ===== */
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Register failed");
  }

  return res.json();
}
