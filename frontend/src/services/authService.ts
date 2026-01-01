/* ========================
   Types
======================== */

export interface LoginResponse {
  id: string;
  email: string;
  role: "admin" | "user";
  token: string;
}

/* ========================
   Fake Login API
======================== */
/**
 * Fake login API
 * 規則：
 * - password 長度 >= 6 才算有效（模擬後端驗證）
 * - email 包含 "admin" → admin
 * - 其他 → user
 */
export async function loginAPI(
  email: string,
  password: string
): Promise<LoginResponse> {
  await new Promise((res) => setTimeout(res, 800));

  if (!email.includes("@")) {
    throw new Error("Invalid email format");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const role: "admin" | "user" = email
    .toLowerCase()
    .includes("admin")
    ? "admin"
    : "user";

  return {
    id: crypto.randomUUID(),
    email,
    role,
    token: `fake-${role}-token`,
  };
}

/* ========================
   Fake Register API (Bonus)
======================== */
/**
 * Fake register API
 * - 所有新註冊帳號一律是 user
 */
export async function registerAPI(
  email: string,
  password: string
): Promise<LoginResponse> {
  await new Promise((res) => setTimeout(res, 800));

  if (!email.includes("@")) {
    throw new Error("Invalid email format");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  return {
    id: crypto.randomUUID(),
    email,
    role: "user",
    token: "fake-register-token",
  };
}
