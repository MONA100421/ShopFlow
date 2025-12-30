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
 * ⭐ 重點：
 * addToCart 不再只收 Product
 * 而是同時收 product + quantity
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
       Add to Cart (一次加 N 個)
    ========================== */
    addToCart(
      state,
      action: PayloadAction<AddToCartPayload>
    ) {
      const { product, quantity } = action.payload;

      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // 已存在 → 疊加數量
        existingItem.quantity += quantity;
      } else {
        // 不存在 → 新增一筆
        state.items.push({
          product,
          quantity,
        });
      }
    },

    /* =========================
       Remove item
    ========================== */
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      );
    },

    /* =========================
       Increase quantity (+1)
    ========================== */
    increaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(
        (i) => i.product.id === action.payload
      );
      if (item) {
        item.quantity += 1;
      }
    },

    /* =========================
       Decrease quantity (-1)
    ========================== */
    decreaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(
        (i) => i.product.id === action.payload
      );
      if (item && item.quantity > 1) {
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
