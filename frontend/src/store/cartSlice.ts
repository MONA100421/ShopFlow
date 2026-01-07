import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
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

/* ======================================================
   Async Thunks（未來接後端用）
====================================================== */

export const fetchCartThunk = createAsyncThunk<
  CartItem[],
  void,
  { rejectValue: string }
>("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    return await fetchCartAPI();
  } catch {
    return rejectWithValue("Failed to load cart");
  }
});

export const addToCartThunk = createAsyncThunk<
  CartItem[],
  { product: Product; quantity: number },
  { rejectValue: string }
>("cart/add", async ({ product, quantity }, { rejectWithValue }) => {
  try {
    return await addToCartAPI(product, quantity);
  } catch {
    return rejectWithValue("Add to cart failed");
  }
});

export const updateQuantityThunk = createAsyncThunk<
  CartItem[],
  { productId: string; delta: 1 | -1 },
  { rejectValue: string }
>("cart/updateQuantity", async (payload, { rejectWithValue }) => {
  try {
    return await updateCartQuantityAPI(
      payload.productId,
      payload.delta
    );
  } catch {
    return rejectWithValue("Update quantity failed");
  }
});

export const removeFromCartThunk = createAsyncThunk<
  CartItem[],
  string,
  { rejectValue: string }
>("cart/remove", async (productId, { rejectWithValue }) => {
  try {
    return await removeFromCartAPI(productId);
  } catch {
    return rejectWithValue("Remove item failed");
  }
});

export const clearCartThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("cart/clear", async (_, { rejectWithValue }) => {
  try {
    await clearCartAPI();
  } catch {
    return rejectWithValue("Clear cart failed");
  }
});

/* ======================================================
   State
====================================================== */

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  initialized: false,
};

/* ======================================================
   Slice（🔥 關鍵在 reducers）
====================================================== */

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    /** 前端同步用：Add to cart */
    addToCart: (
      state,
      action: PayloadAction<{
        product: Product;
        quantity: number;
      }>
    ) => {
      const { product, quantity } = action.payload;

      const existing = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
        });
      }
    },

    /** +1 */
    increaseQuantity: (
      state,
      action: PayloadAction<string>
    ) => {
      const item = state.items.find(
        (i) => i.product.id === action.payload
      );
      if (item) item.quantity += 1;
    },

    /** -1（最少 1） */
    decreaseQuantity: (
      state,
      action: PayloadAction<string>
    ) => {
      const item = state.items.find(
        (i) => i.product.id === action.payload
      );
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    /** Remove item */
    removeFromCart: (
      state,
      action: PayloadAction<string>
    ) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      );
    },

    /** Clear cart */
    clearCart: (state) => {
      state.items = [];
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== Fetch ===== */
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Fetch cart failed";
      })

      /* ===== Async sync ===== */
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
        state.initialized = true;
      });
  },
});

/* ======================================================
   Exports（🔥 這裡是你之前缺的）
====================================================== */

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
