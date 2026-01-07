import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { CartItem } from "../types/CartItem";
import type { Product } from "../types/Product";
import {
  fetchCartAPI,
  addToCartAPI,
  updateCartQuantityAPI,
  removeFromCartAPI,
  clearCartAPI,
} from "../services/cartService";

/* ================= Thunks ================= */

export const fetchCartThunk = createAsyncThunk<CartItem[]>(
  "cart/fetch",
  fetchCartAPI
);

export const addToCartThunk = createAsyncThunk<
  CartItem[],
  { product: Product; quantity: number }
>("cart/add", ({ product, quantity }) =>
  addToCartAPI(product, quantity)
);

export const updateQuantityThunk = createAsyncThunk<
  CartItem[],
  { productId: string; delta: 1 | -1 }
>("cart/update", ({ productId, delta }) =>
  updateCartQuantityAPI(productId, delta)
);

export const removeFromCartThunk = createAsyncThunk<
  CartItem[],
  string
>("cart/remove", removeFromCartAPI);

export const clearCartThunk = createAsyncThunk(
  "cart/clear",
  clearCartAPI
);

/* ================= State ================= */

interface CartState {
  items: CartItem[];
  loading: boolean;
  initialized: boolean;
}

const initialState: CartState = {
  items: [],
  loading: false,
  initialized: false,
};

/* ================= Slice ================= */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
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
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
