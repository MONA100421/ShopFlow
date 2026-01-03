import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { API_BASE } from "../../config";

const TOKEN_KEY = "token";

/* ================= 工具函数 ================= */

function cleanToken(raw: string): string {
  return String(raw || "")
    .replace(/^Bearer\s+/i, "")
    .trim()
    .replace(/^"(.+)"$/, "$1");
}

function readToken(): string {
  try {
    return cleanToken(localStorage.getItem(TOKEN_KEY) || "");
  } catch {
    return "";
  }
}

function writeToken(token: string): void {
  try {
    const t = cleanToken(token);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** 兼容各种后端返回结构 */
function extractToken(data: any): string {
  const cand =
    data?.token ??
    data?.accessToken ??
    data?.jwt ??
    data?.data?.token ??
    data?.data?.accessToken ??
    "";
  return cleanToken(String(cand || ""));
}

/* ================= 类型 ================= */

export type AuthUser = {
  role?: string;
  email?: string;
  name?: string;
  [k: string]: any;
} | null;

export type AuthState = {
  token: string;
  user: AuthUser;
  loading: boolean;
  error: string;
  checked: boolean; // ⭐ 关键：是否已通过 /me 校验
};

export type SigninArgs = {
  email: string;
  password: string;
};

export type SignupArgs = {
  email: string;
  password: string;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};

/* ================= Thunks ================= */

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
    if (!resp.ok) {
      return rejectWithValue(data?.message || "Login failed");
    }

    const token = extractToken(data);
    if (!token) {
      return rejectWithValue(
        `No token returned from server. Keys: ${Object.keys(data || {}).join(
          ", "
        )}`
      );
    }

    writeToken(token);

    return {
      token,
      user: (data?.user ?? data?.data?.user ?? null) as AuthUser,
    };
  } catch (e: any) {
    return rejectWithValue(e?.message || "Login failed");
  }
});

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
    if (!resp.ok) {
      return rejectWithValue(data?.message || "Signup failed");
    }

    const token = extractToken(data);
    if (token) writeToken(token);

    return {
      token,
      user: (data?.user ?? data?.data?.user ?? null) as AuthUser,
    };
  } catch (e: any) {
    return rejectWithValue(e?.message || "Signup failed");
  }
});

/* ================= Slice ================= */

const initialState: AuthState = {
  token: readToken(),
  user: null,
  loading: false,
  error: "",
  checked: false, // ⭐ 初始：还没通过 /me
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = "";
      state.user = null;
      state.error = "";
      state.checked = false;
      writeToken("");
    },
    clearAuthError(state) {
      state.error = "";
    },
    /** ⭐ AdminRoute 在 /me 成功后调用 */
    setAuthChecked(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload ?? null;
      state.checked = true;
    },
  },
  extraReducers: (b) => {
    b.addCase(signin.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    b.addCase(signin.fulfilled, (state, action) => {
      state.loading = false;
      state.token = cleanToken(action.payload.token || "");
      state.user = action.payload.user ?? null;
      state.checked = false; // ⭐ 等待 /me 校验
    });
    b.addCase(signin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Login failed";
      state.token = "";
      state.user = null;
      state.checked = false;
      writeToken("");
    });

    b.addCase(signup.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    b.addCase(signup.fulfilled, (state, action) => {
      state.loading = false;
      const token = cleanToken(action.payload.token || "");
      if (token) {
        state.token = token;
        state.user = action.payload.user ?? null;
        state.checked = false;
      }
    });
    b.addCase(signup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Signup failed";
    });
  },
});

export const {
  logout,
  clearAuthError,
  setAuthChecked, // ⭐ 新增
} = authSlice.actions;

export default authSlice.reducer;
