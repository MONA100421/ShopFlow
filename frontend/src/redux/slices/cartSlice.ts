import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const LS_CART = "sf_cart";
const LS_PROMO = "sf_promo";

type CartItemsMap = Record<string, number>;

export type CartState = {
  // cart: { [productId]: qty }
  items: CartItemsMap;
  promo: string;
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function readPromo(): string {
  try {
    return localStorage.getItem(LS_PROMO) || "";
  } catch {
    return "";
  }
}

function writePromo(v: string): void {
  try {
    localStorage.setItem(LS_PROMO, v || "");
  } catch {
    // ignore
  }
}

type AddToCartPayload = { id: string; delta?: number };
type SetQtyPayload = { id: string; qty: number };

const initialState: CartState = {
  items: loadJson<CartItemsMap>(LS_CART, {}),
  promo: readPromo(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<AddToCartPayload>) {
      const { id, delta = 1 } = action.payload;
      const pid = String(id || "");
      if (!pid) return;

      const cur = Number(state.items[pid] || 0);
      const val = Math.max(0, cur + Number(delta || 0));

      if (val === 0) delete state.items[pid];
      else state.items[pid] = val;

      // ✅ 持久化
      saveJson(LS_CART, state.items);
    },

    setQty(state, action: PayloadAction<SetQtyPayload>) {
      const { id, qty } = action.payload;
      const pid = String(id || "");
      if (!pid) return;

      const val = Math.max(0, Number(qty || 0));
      if (val === 0) delete state.items[pid];
      else state.items[pid] = val;

      // ✅ 持久化
      saveJson(LS_CART, state.items);
    },

    removeFromCart(state, action: PayloadAction<string>) {
      const pid = String(action.payload || "");
      if (!pid) return;

      delete state.items[pid];

      // ✅ 持久化
      saveJson(LS_CART, state.items);
    },

    clearCart(state) {
      state.items = {};

      // ✅ 持久化
      saveJson(LS_CART, state.items);
    },

    setPromo(state, action: PayloadAction<string>) {
      const v = String(action.payload ?? "");
      state.promo = v;

      // ✅ 持久化
      writePromo(v);
    },
  },
});

export const { addToCart, setQty, removeFromCart, clearCart, setPromo } =
  cartSlice.actions;

export default cartSlice.reducer;
