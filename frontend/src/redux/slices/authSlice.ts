import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { API_BASE } from "../../config";

// ✅ 简单 token 读写（先不搞太复杂）
const TOKEN_KEY = "token";

function readToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function writeToken(token: string): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

// --- Types ---
export type AuthUser = {
  role?: string;
  email?: string;
  name?: string;
  [k: string]: any; // 兼容后端返回的其他字段
} | null;

export type AuthState = {
  token: string;
  user: AuthUser;
  loading: boolean;
  error: string;
};

export type SigninArgs = {
  email: string;
  password: string;
  role: "user" | "manager";
};

export type SignupArgs = {
  email: string;
  password: string;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};

// ✅ 登录
export const signin = createAsyncThunk<
  AuthResult,
  SigninArgs,
  { rejectValue: string }
>("auth/signin", async ({ email, password }, { rejectWithValue }) => {
  try {
    const resp = await fetch(`${API_BASE}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: any = await resp.json().catch(() => ({}));
    if (!resp.ok) return rejectWithValue(data?.message || "Login failed");

    const token = String(data?.token || "");
    if (!token) return rejectWithValue("No token returned from server");

    writeToken(token);

    return { token, user: (data?.user ?? null) as AuthUser };
  } catch (e: any) {
    return rejectWithValue(e?.message || "Login failed");
  }
});

// ✅ 注册（如果你后端有 signup）
export const signup = createAsyncThunk<
  AuthResult,
  SignupArgs,
  { rejectValue: string }
>("auth/signup", async ({ email, password }, { rejectWithValue }) => {
  try {
    const resp = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: any = await resp.json().catch(() => ({}));
    if (!resp.ok) return rejectWithValue(data?.message || "Signup failed");

    // 有的 signup 会直接给 token；没有也没关系
    const token = String(data?.token || "");
    if (token) writeToken(token);

    return { token, user: (data?.user ?? null) as AuthUser };
  } catch (e: any) {
    return rejectWithValue(e?.message || "Signup failed");
  }
});

const initialState: AuthState = {
  token: readToken(),
  user: null,
  loading: false,
  error: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = "";
      state.user = null;
      state.error = "";
      writeToken("");
    },
    clearAuthError(state) {
      state.error = "";
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload ?? null;
    },
  },
  extraReducers: (b) => {
    b.addCase(signin.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    b.addCase(signin.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload?.token || "";
      state.user = action.payload?.user ?? null;
    });
    b.addCase(signin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Login failed";
    });

    b.addCase(signup.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    b.addCase(signup.fulfilled, (state, action) => {
      state.loading = false;
      // signup 不一定返回 token；返回就更新，否则沿用现有 token
      state.token = action.payload?.token || state.token;
      state.user = action.payload?.user ?? state.user;
    });
    b.addCase(signup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Signup failed";
    });
  },
});

export const { logout, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
