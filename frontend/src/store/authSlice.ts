import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/User";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  status: "idle",
  error: null,
};

/* =========================
   loginThunk（Mock）
========================= */
export const loginThunk = createAsyncThunk<
  User, // ✅ 成功回傳 User
  { email: string; password: string }, // thunk argument type
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  // mock delay
  await new Promise((r) => setTimeout(r, 500));

  // mock validation
  if (!email || !password) {
    return rejectWithValue("Email and password are required");
  }

  // mock validation
  const isAdmin = email.toLowerCase().includes("admin");

  if (!email.includes("@")) {
    return rejectWithValue("Invalid email or password");
  }

  // mock user data
  const user: User = {
    id: crypto.randomUUID(),
    email,
    role: isAdmin ? "admin" : "user",
  };

  // mock storing user in localStorage
  localStorage.setItem("user", JSON.stringify(user));

  return user;
});

/* =========================
   Slice
========================= */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("user");
    },
    restoreUser(state) {
      const stored = localStorage.getItem("user");
      if (stored) {
        state.user = JSON.parse(stored);
        state.isAuthenticated = true;
      }
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.initialized = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Login failed";
      });
  },
});

export const { logout, restoreUser } = authSlice.actions;
export default authSlice.reducer;
