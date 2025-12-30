// src/store/authSlice.ts
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
    loginSuccess(state, action: PayloadAction<User>) {
    state.user = action.payload;
    state.isAuthenticated = true;
    state.initialized = true;

    localStorage.setItem("user", JSON.stringify(action.payload));
    },

    logout(state) {
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem("user");
    },

    restoreUser(state) {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        state.user = JSON.parse(storedUser);
        state.isAuthenticated = true;
    }

    state.initialized = true;
    },
  },
});

export const { loginSuccess, logout, restoreUser } = authSlice.actions;
export default authSlice.reducer;
