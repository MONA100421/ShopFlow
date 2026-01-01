import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  loginAPI,
  registerAPI,
  LoginResponse,
} from "../services/authService";

/* ========================
   State Types
======================== */

interface AuthState {
  user: LoginResponse | null;
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
  LoginResponse,
  AuthPayload,
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const user = await loginAPI(email, password);

    localStorage.setItem("authUser", JSON.stringify(user));

    return user;
  } catch (err) {
    return rejectWithValue("Invalid email or password");
  }
});

/** -------- Register -------- */
export const registerThunk = createAsyncThunk<
  LoginResponse,
  AuthPayload,
  { rejectValue: string }
>("auth/register", async ({ email, password }, { rejectWithValue }) => {
  try {
    const user = await registerAPI(email, password);


    localStorage.setItem("authUser", JSON.stringify(user));

    return user;
  } catch (err) {
    return rejectWithValue("Register failed");
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
      state.isAuthenticated = false;
      state.error = null;
      state.initialized = true;

      localStorage.removeItem("authUser");
    },

    restoreUser(state) {
      const stored = localStorage.getItem("authUser");

      if (stored) {
        state.user = JSON.parse(stored);
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.isAuthenticated = false;
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
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.error = null;
          state.initialized = true;
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
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.error = null;
          state.initialized = true;
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

export const { logout, restoreUser } = authSlice.actions;
export default authSlice.reducer;
