// frontend/src/store/cartSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { CartItem } from "../types/CartItem";
import {
  fetchCartAPI,
  addToCartAPI,
  updateCartQuantityAPI,
  removeFromCartAPI,
} from "../services/cartService";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
} from "../utils/guestCart";
import { logoutThunk } from "./authSlice";

/* ================= Thunks ================= */

/**
 * 🔁 Hydrate user cart（明確入口）
 */
export const fetchUserCartThunk = createAsyncThunk<CartItem[]>(
  "cart/fetchUser",
  async () => {
    return fetchCartAPI();
  }
);

/**
 * 🔁 Hydrate guest cart
 */
export const fetchGuestCartThunk = createAsyncThunk<CartItem[]>(
  "cart/fetchGuest",
  async () => {
    return getGuestCart();
  }
);

/**
 * ➕ Add to cart
 * 🔥 mutation 時用 getState() 是安全的
 */
export const addToCartThunk = createAsyncThunk<
  CartItem[],
  CartItem,
  { state: any }
>("cart/add", async (item, { getState }) => {
  const isAuthenticated = getState().auth.isAuthenticated;

  return isAuthenticated
    ? addToCartAPI(item.productId, item.quantity)
    : addToGuestCart(item);
});

/**
 * 🔼🔽 Update quantity
 */
export const updateQuantityThunk = createAsyncThunk<
  CartItem[],
  { productId: string; delta: 1 | -1 },
  { state: any }
>("cart/update", async ({ productId, delta }, { getState }) => {
  const isAuthenticated = getState().auth.isAuthenticated;

  return isAuthenticated
    ? updateCartQuantityAPI(productId, delta)
    : updateGuestCartQuantity(productId, delta);
});

/**
 * ❌ Remove item
 */
export const removeFromCartThunk = createAsyncThunk<
  CartItem[],
  string,
  { state: any }
>("cart/remove", async (productId, { getState }) => {
  const isAuthenticated = getState().auth.isAuthenticated;

  return isAuthenticated
    ? removeFromCartAPI(productId)
    : removeFromGuestCart(productId);
});

/* ================= State ================= */

interface CartState {
  items: CartItem[];
  ready: boolean;
}

const initialState: CartState = {
  items: [],
  ready: false,
};

/* ================= Slice ================= */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // hydrate
      .addCase(fetchUserCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.ready = true;
      })
      .addCase(fetchGuestCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.ready = true;
      })

      // mutations
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateQuantityThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default cartSlice.reducer;
