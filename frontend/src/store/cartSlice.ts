import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { CartItem } from "../types/CartItem";
import {
  fetchCartAPI,
  addToCartAPI,
  updateCartQuantityAPI,
  removeFromCartAPI,
  clearCartAPI,
} from "../services/cartService";

/* ================= Thunks ================= */

/**
 * Fetch cart
 * - 401 = 未登入 → 安靜忽略
 */
export const fetchCartThunk = createAsyncThunk<
  CartItem[],
  void,
  { rejectValue: number }
>("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    return await fetchCartAPI();
  } catch (err: any) {
    if (err.message?.includes("401")) {
      return rejectWithValue(401);
    }
    throw err;
  }
});

export const addToCartThunk = createAsyncThunk<
  CartItem[],
  { productId: string; quantity: number }
>("cart/add", async ({ productId, quantity }) => {
  return addToCartAPI(productId, quantity);
});

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
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  initialized: false,
  error: null,
};

/* ================= Slice ================= */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ===== Fetch ===== */
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;

        // ✅ 401：未登入，忽略
        if (action.payload === 401) {
          return;
        }

        state.error = "Failed to load cart";
      })

      /* ===== Mutations ===== */
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
