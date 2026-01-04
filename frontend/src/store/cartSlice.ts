import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../types/CartItem";
import type { Product } from "../types/Product";

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

/**
 * ⭐ addToCart payload
 * 同時包含 product + quantity
 */
interface AddToCartPayload {
  product: Product;
  quantity: number;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /* =========================
       Add to Cart (核心防呆)
    ========================== */
    addToCart(
      state,
      action: PayloadAction<AddToCartPayload>
    ) {
      const { product, quantity } = action.payload;

      // ❌ 庫存為 0，直接拒絕
      if (product.stock <= 0) return;

      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        const newQuantity =
          existingItem.quantity + quantity;

        // 🔑 關鍵：數量不得超過庫存
        existingItem.quantity = Math.min(
          newQuantity,
          product.stock
        );
      } else {
        // 🔑 新增時也要 clamp
        state.items.push({
          product,
          quantity: Math.min(quantity, product.stock),
        });
      }
    },

    /* =========================
       Remove item
    ========================== */
    removeFromCart(
      state,
      action: PayloadAction<string>
    ) {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      );
    },

    /* =========================
       Increase quantity (+1)
       ❗ 不得超過 stock
    ========================== */
    increaseQuantity(
      state,
      action: PayloadAction<string>
    ) {
      const item = state.items.find(
        (i) => i.product.id === action.payload
      );

      if (!item) return;

      if (item.quantity < item.product.stock) {
        item.quantity += 1;
      }
    },

    /* =========================
       Decrease quantity (-1)
       ❗ 最小為 1
    ========================== */
    decreaseQuantity(
      state,
      action: PayloadAction<string>
    ) {
      const item = state.items.find(
        (i) => i.product.id === action.payload
      );

      if (!item) return;

      if (item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    /* =========================
       Clear cart
    ========================== */
    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
