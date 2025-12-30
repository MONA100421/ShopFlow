import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/User";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ===============================
    // Login success
    // ===============================
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;

      // persist to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    // ===============================
    // Logout
    // ===============================
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;

      localStorage.removeItem("user");
    },

    // ===============================
    // Restore user from localStorage
    // (called once when app starts)
    // ===============================
    restoreUser(state) {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          state.user = JSON.parse(storedUser) as User;
          state.isAuthenticated = true;
        } catch {
          // corrupted localStorage
          localStorage.removeItem("user");
          state.user = null;
          state.isAuthenticated = false;
        }
      }

      state.initialized = true;
    },
  },
});

export const {
  loginSuccess,
  logout,
  restoreUser,
} = authSlice.actions;

export default authSlice.reducer;
