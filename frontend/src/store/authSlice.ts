import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  loginAPI,
  registerAPI,
  AuthResponse,
  User,
} from "../services/authService";

/* ========================
   State Types
======================== */

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

/* ========================
   Initial State
======================== */

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

/* ========================
   Payload Types
======================== */

interface AuthPayload {
  email: string;
  password: string;
}

/* ========================
   Thunks
======================== */

/** -------- Login -------- */
export const loginThunk = createAsyncThunk<
  AuthResponse,
  AuthPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await loginAPI(payload);
  } catch (err: any) {
    return rejectWithValue(err?.message || "Invalid email or password");
  }
});

/** -------- Register -------- */
export const registerThunk = createAsyncThunk<
  AuthResponse,
  AuthPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await registerAPI(payload);
  } catch (err: any) {
    return rejectWithValue(err?.message || "Register failed");
  }
});

/* ========================
   Slice
======================== */

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.initialized = true;

      localStorage.removeItem("auth");
    },

    /** 用於 App 啟動時還原登入狀態（refresh 不掉） */
    restoreAuth(state) {
      const stored = localStorage.getItem("auth");

      if (stored) {
        try {
          const parsed: AuthResponse = JSON.parse(stored);
          state.user = parsed.user;
          state.token = parsed.token;
          state.isAuthenticated = true;
        } catch {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem("auth");
        }
      }

      state.initialized = true;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== Login ===== */
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
          state.initialized = true;

          // persistence（demo/refresh 用）
          localStorage.setItem("auth", JSON.stringify(action.payload));
        }
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
        state.isAuthenticated = false;
      })

      /* ===== Register ===== */
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerThunk.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
          state.initialized = true;

          // persistence（demo/refresh 用）
          localStorage.setItem("auth", JSON.stringify(action.payload));
        }
      )
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Register failed";
        state.isAuthenticated = false;
      });
  },
});

/* ========================
   Exports
======================== */

export const { logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
