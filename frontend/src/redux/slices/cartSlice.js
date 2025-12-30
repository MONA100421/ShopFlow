import { createSlice } from "@reduxjs/toolkit";

const LS_CART = "sf_cart";
const LS_PROMO = "sf_promo";

function loadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

const initialState = {
    // cart: { [productId]: qty }
    items: loadJson(LS_CART, {}),
    promo: (() => {
        try {
            return localStorage.getItem(LS_PROMO) || "";
        } catch {
            return "";
        }
    })(),
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart(state, action) {
            const { id, delta = 1 } = action.payload || {};
            if (!id) return;
            const cur = Number(state.items[id] || 0);
            const val = Math.max(0, cur + Number(delta || 0));
            if (val === 0) delete state.items[id];
            else state.items[id] = val;
        },
        setQty(state, action) {
            const { id, qty } = action.payload || {};
            if (!id) return;
            const val = Math.max(0, Number(qty || 0));
            if (val === 0) delete state.items[id];
            else state.items[id] = val;
        },
        removeFromCart(state, action) {
            const id = String(action.payload || "");
            if (!id) return;
            delete state.items[id];
        },
        clearCart(state) {
            state.items = {};
        },
        setPromo(state, action) {
            state.promo = action.payload ?? "";
        },
    },
});

export const { addToCart, setQty, removeFromCart, clearCart, setPromo } =
    cartSlice.actions;

export default cartSlice.reducer;
