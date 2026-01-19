const USE_MOCK_API = false;
const API_BASE_URL = "http://localhost:4000/api/auth";

export interface User {
  id: string;
  email?: string;
  role?: "admin" | "user";
}

export interface AuthResponse {
  ok: boolean;
  userId: string;
}

async function mockDelay(ms = 800) {
  await new Promise((res) => setTimeout(res, ms));
}

function generateMockUser(email: string): User {
  return {
    id: crypto.randomUUID(),
    email,
  };
}

export async function loginAPI(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  /* Mock API */
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
      ok: true,
      userId: generateMockUser(email).id,
    };
  }

  /* Real Express Session API */
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Login failed");
  }

  return res.json();
}

export async function registerAPI(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  /* Mock API */
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
      ok: true,
      userId: crypto.randomUUID(),
    };
  }

  /* Real Express Session API */
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Register failed");
  }

  return res.json();
}

export async function logoutAPI(): Promise<void> {
  await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function meAPI(): Promise<User | null> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
