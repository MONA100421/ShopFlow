export interface LoginResponse {
  id: string;
  email: string;
  role: "admin" | "user";
  token: string;
}

/**
 * Fake login API
 *  - admin@test.com / 123456 → admin
 *  - user@test.com / 123456 → user
 */
export async function loginAPI(
  email: string,
  password: string
): Promise<LoginResponse> {
  // ⏳ 模擬 API latency
  await new Promise((res) => setTimeout(res, 800));

  // mock authentication logic
  if (password === "123456") {
    if (email === "admin@test.com") {
      return {
        id: "1",
        email,
        role: "admin",
        token: "fake-admin-token",
      };
    }

    if (email === "user@test.com") {
      return {
        id: "2",
        email,
        role: "user",
        token: "fake-user-token",
      };
    }
  }

  throw new Error("Invalid email or password");
}
