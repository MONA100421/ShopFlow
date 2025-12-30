import { createSelector } from "@reduxjs/toolkit";

const TAX_RATE = 0.1;

export const selectProducts = (state) => state.products.items || [];
export const selectCartMap = (state) => state.cart.items || {};
export const selectPromo = (state) => state.cart.promo || "";

export const selectCartItems = createSelector(
    [selectCartMap, selectProducts],
    (cart, products) => {
        const byId = new Map(products.map((p) => [String(p._id || p.id), p]));

        return Object.entries(cart)
            .map(([id, qty]) => {
                const p = byId.get(String(id));
                if (!p) return null;
                const pid = String(p._id || p.id);

                return {
                    ...p,
                    id: pid, // ✅ 保持你原来 CartDrawer/Cart.jsx 用 it.id 的逻辑
                    qty,
                    lineTotal: Number(p.price || 0) * Number(qty || 0),
                    image: p.image || "https://via.placeholder.com/120?text=No+Image",
                };
            })
            .filter(Boolean);
    }
);

export const selectSubtotal = createSelector([selectCartItems], (items) =>
    items.reduce((s, it) => s + it.lineTotal, 0)
);

export const selectTax = createSelector([selectSubtotal], (subtotal) =>
    +(subtotal * TAX_RATE).toFixed(2)
);

// ⚠️ 为了 100% 保持你现在功能：
// SAVE10 = min(10, subtotal)（是 $10 off，不是 10% off）
// SAVE20 = min(20, subtotal)
export const selectDiscount = createSelector(
    [selectPromo, selectSubtotal],
    (promo, subtotal) => {
        const code = String(promo || "").trim().toUpperCase();
        if (!code) return 0;
        if (code === "SAVE10") return Math.min(10, subtotal);
        if (code === "SAVE20") return Math.min(20, subtotal);
        return 0;
    }
);

export const selectTotal = createSelector(
    [selectSubtotal, selectTax, selectDiscount],
    (subtotal, tax, discount) => +(subtotal + tax - discount).toFixed(2)
);

export const selectCartCount = createSelector([selectCartItems], (items) =>
    items.reduce((c, it) => c + it.qty, 0)
);
