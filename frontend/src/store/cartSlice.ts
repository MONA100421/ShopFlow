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

export const fetchCartThunk = createAsyncThunk<
  CartItem[],
  void,
  { state: any }
>("cart/fetch", async (_, { getState }) => {
  const { isAuthenticated } = getState().auth;
  return isAuthenticated ? fetchCartAPI() : getGuestCart();
});

export const addToCartThunk = createAsyncThunk<
  CartItem[],
  CartItem,
  { state: any }
>("cart/add", async (item, { getState }) => {
  const { isAuthenticated } = getState().auth;

  return isAuthenticated
    ? addToCartAPI(item.productId, item.quantity)
    : addToGuestCart(item);
});

export const updateQuantityThunk = createAsyncThunk<
  CartItem[],
  { productId: string; delta: 1 | -1 },
  { state: any }
>("cart/update", async ({ productId, delta }, { getState }) => {
  const { isAuthenticated } = getState().auth;

  return isAuthenticated
    ? updateCartQuantityAPI(productId, delta)
    : updateGuestCartQuantity(productId, delta);
});

export const removeFromCartThunk = createAsyncThunk<
  CartItem[],
  string,
  { state: any }
>("cart/remove", async (productId, { getState }) => {
  const { isAuthenticated } = getState().auth;

  return isAuthenticated
    ? removeFromCartAPI(productId)
    : removeFromGuestCart(productId);
});

/* ================= State ================= */

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
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
      .addCase(logoutThunk.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
