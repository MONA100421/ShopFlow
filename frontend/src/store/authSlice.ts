import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { loginAPI, LoginResponse } from "../services/authService";

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
   Thunk Payload
======================== */

interface LoginPayload {
  email: string;
  password: string;
}

/* ========================
   Async Thunk (Login)
======================== */

export const loginThunk = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const user = await loginAPI(email, password);

    // ✅ side-effect 放在 thunk（業界標準）
    localStorage.setItem("authUser", JSON.stringify(user));

    return user;
  } catch (err) {
    return rejectWithValue("Invalid email or password");
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

      // ✅ 非常重要：Header / RequireAdmin 會用到
      state.initialized = true;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ===== login pending ===== */
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /* ===== login success ===== */
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

      /* ===== login failed ===== */
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
        state.isAuthenticated = false;
      });
  },
});

/* ========================
   Exports
======================== */

export const { logout, restoreUser } = authSlice.actions;
export default authSlice.reducer;
