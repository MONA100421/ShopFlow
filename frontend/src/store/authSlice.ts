// frontend/src/store/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../services/authService";
import {
  loginAPI,
  registerAPI,
  logoutAPI,
  meAPI,
} from "../services/authService";
import { mergeCartAPI } from "../services/cartService";
import { getGuestCart, clearGuestCart } from "../utils/guestCart";
import { fetchCartThunk } from "./cartSlice";

/* ================= State ================= */

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean; // 🔐 auth 狀態是否已恢復
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

/* ================= Thunks ================= */

/**
 * 🔐 Login（唯一 merge 入口）
 * 流程保證：
 * 1. 建立 session
 * 2. merge guest cart（如有）
 * 3. 🔥 立刻 fetch 合併後的 user cart（關鍵）
 * 4. 回傳 user（此時 cart 已是最終狀態）
 */
export const loginThunk = createAsyncThunk<
  User | null,
  { email: string; password: string },
  { dispatch: any }
>("auth/login", async (payload, { dispatch }) => {
  // 1️⃣ 建立 session
  await loginAPI(payload);

  // 2️⃣ merge guest cart（只在 login 發生）
  const guestItems = getGuestCart();
  if (guestItems.length > 0) {
    await mergeCartAPI(
      guestItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }))
    );
    clearGuestCart(); // 🔥 merge 後永久清空
  }

  // 3️⃣ 🔥 關鍵：同步抓「最終 cart」
  await dispatch(fetchCartThunk()).unwrap();

  // 4️⃣ 回傳 user
  return await meAPI();
});

/**
 * 📝 Register → Login flow
 * 不自己處理 cart，完全交給 loginThunk
 */
export const registerThunk = createAsyncThunk<
  User | null,
  { email: string; password: string },
  { dispatch: any }
>("auth/register", async (payload, { dispatch }) => {
  await registerAPI(payload);
  return dispatch(loginThunk(payload)).unwrap();
});

/**
 * 🔁 Restore auth（App 啟動 / refresh）
 * ❌ 不做 merge
 * ✅ 只恢復 session + 抓對應 cart（user / guest）
 */
export const restoreAuthThunk = createAsyncThunk<
  User | null,
  void,
  { dispatch: any }
>("auth/restore", async (_, { dispatch }) => {
  const user = await meAPI();

  // 🔥 restore 完就立刻 hydrate cart
  await dispatch(fetchCartThunk()).unwrap();

  return user;
});

/**
 * 🚪 Logout
 * - 清 session
 * - cart 由 cartSlice 清空
 */
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async () => {
    await logoutAPI();
  }
);

/* ================= Slice ================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== Login =====
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
        state.initialized = true;
      })

      // ===== Register =====
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.initialized = true;
      })

      // ===== Restore =====
      .addCase(restoreAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.initialized = true;
      })

      // ===== Logout =====
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      });
  },
});

export default authSlice.reducer;
