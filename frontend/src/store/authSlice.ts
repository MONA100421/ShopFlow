import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../services/authService";
import {
  loginAPI,
  registerAPI,
  logoutAPI,
  meAPI,
} from "../services/authService";

/* ========================
   State
======================== */

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
};

/* ========================
   Thunks
======================== */

// 🔐 Login
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => {
    await loginAPI(payload);
    // session-based：登入後再取目前使用者
    return await meAPI();
  }
);

// 📝 Register（demo / real 都可）
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: { email: string; password: string }) => {
    await registerAPI(payload);
    // 註冊成功後直接視為登入
    return await meAPI();
  }
);

// 🔁 Restore auth（頁面 refresh）
export const restoreAuthThunk = createAsyncThunk(
  "auth/restore",
  async () => {
    return await meAPI();
  }
);

// 🚪 Logout
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async () => {
    await logoutAPI();
  }
);

/* ========================
   Slice
======================== */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ===== Login ===== */
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })

      /* ===== Register ===== */
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Register failed";
      })

      /* ===== Restore ===== */
      .addCase(restoreAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.initialized = true;
      })

      /* ===== Logout ===== */
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      });
  },
});

export default authSlice.reducer;
