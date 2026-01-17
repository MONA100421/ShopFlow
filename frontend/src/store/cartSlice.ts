// frontend/src/store/cartSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { CartItem } from "../types/CartItem";
import {
  fetchCartAPI,
  addToCartAPI,
  updateCartQuantityAPI,
  removeFromCartAPI,
} from "../services/cartService";
import { logoutThunk } from "./authSlice";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
} from "../utils/guestCart";

/* ================= Thunks ================= */

/**
 * Fetch cart
 * - 登入：API
 * - 未登入：guest cart
 */
export const fetchCartThunk = createAsyncThunk<
  CartItem[],
  void,
  { state: any }
>("cart/fetch", async (_, { getState }) => {
  const isAuthenticated =
    getState().auth.isAuthenticated;

  if (!isAuthenticated) {
    return getGuestCart();
  }

  return await fetchCartAPI();
});

/**
 * Add to cart
 */
export const addToCartThunk = createAsyncThunk<
  CartItem[],
  CartItem,
  { state: any }
>("cart/add", async (item, { getState }) => {
  const isAuthenticated =
    getState().auth.isAuthenticated;

  if (!isAuthenticated) {
    return addToGuestCart(item);
  }

  return await addToCartAPI(
    item.productId,
    item.quantity
  );
});

/**
 * Update quantity
 */
export const updateQuantityThunk = createAsyncThunk<
  CartItem[],
  { productId: string; delta: 1 | -1 },
  { state: any }
>("cart/update", async ({ productId, delta }, { getState }) => {
  const isAuthenticated =
    getState().auth.isAuthenticated;

  if (!isAuthenticated) {
    return updateGuestCartQuantity(productId, delta);
  }

  return await updateCartQuantityAPI(productId, delta);
});

/**
 * Remove item
 */
export const removeFromCartThunk = createAsyncThunk<
  CartItem[],
  string,
  { state: any }
>("cart/remove", async (productId, { getState }) => {
  const isAuthenticated =
    getState().auth.isAuthenticated;

  if (!isAuthenticated) {
    return removeFromGuestCart(productId);
  }

  return await removeFromCartAPI(productId);
});

/* ================= State ================= */

interface CartState {
  items: CartItem[];
  initialized: boolean;
}

const initialState: CartState = {
  items: [],
  initialized: false,
};

/* ================= Slice ================= */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.initialized = true;
      })

      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      .addCase(updateQuantityThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      /* 🔥 Logout：只清前端 cart，不動 MongoDB */
      .addCase(logoutThunk.fulfilled, (state) => {
        state.items = [];
        state.initialized = false;
      });
  },
});

export default cartSlice.reducer;
