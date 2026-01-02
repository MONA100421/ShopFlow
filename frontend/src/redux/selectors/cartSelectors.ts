import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const TAX_RATE = 0.1;

// ---- 宽松类型：兼容你现在 products / cart slice 仍为 JS ----
export type ProductLike = {
  _id?: string;
  id?: string;
  name?: string;
  price?: number | string;
  image?: string;
  [k: string]: any;
};

export type CartMap = Record<string, number>;

export type CartItemView = ProductLike & {
  id: string; // 统一后的 id
  qty: number;
  lineTotal: number;
  image: string;
};

// ---- base selectors ----
// 说明：这里用 (state as any) 是为了兼容 JS slice 未完全类型化时 RootState 推断不到字段
export const selectProducts = (state: RootState): ProductLike[] =>
  ((state as any).products?.items as ProductLike[]) || [];

export const selectCartMap = (state: RootState): CartMap =>
  ((state as any).cart?.items as CartMap) || {};

export const selectPromo = (state: RootState): string =>
  String((state as any).cart?.promo || "");

// ---- derived selectors ----
export const selectCartItems = createSelector(
  [selectCartMap, selectProducts],
  (cart: CartMap, products: ProductLike[]): CartItemView[] => {
    const byId = new Map<string, ProductLike>(
      products.map((p) => [String(p._id || p.id), p])
    );

    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = byId.get(String(id));
        if (!p) return null;

        const pid = String(p._id || p.id);
        const qtyNum = Number(qty || 0);
        const priceNum = Number(p.price || 0);

        const it: CartItemView = {
          ...p,
          id: pid, // ✅ 保持你原来 CartDrawer/Cart.jsx 用 it.id 的逻辑
          qty: qtyNum,
          lineTotal: priceNum * qtyNum,
          image: p.image || "https://via.placeholder.com/120?text=No+Image",
        };
        return it;
      })
      .filter((x): x is CartItemView => Boolean(x));
  }
);

export const selectSubtotal = createSelector(
  [selectCartItems],
  (items: CartItemView[]): number =>
    items.reduce((s, it) => s + Number(it.lineTotal || 0), 0)
);

export const selectTax = createSelector(
  [selectSubtotal],
  (subtotal: number): number => +(subtotal * TAX_RATE).toFixed(2)
);

// ⚠️ 为了 100% 保持你现在功能：
// SAVE10 = min(10, subtotal)（是 $10 off，不是 10% off）
// SAVE20 = min(20, subtotal)
export const selectDiscount = createSelector(
  [selectPromo, selectSubtotal],
  (promo: string, subtotal: number): number => {
    const code = String(promo || "")
      .trim()
      .toUpperCase();
    if (!code) return 0;
    if (code === "SAVE10") return Math.min(10, subtotal);
    if (code === "SAVE20") return Math.min(20, subtotal);
    return 0;
  }
);

export const selectTotal = createSelector(
  [selectSubtotal, selectTax, selectDiscount],
  (subtotal: number, tax: number, discount: number): number =>
    +(subtotal + tax - discount).toFixed(2)
);

export const selectCartCount = createSelector(
  [selectCartItems],
  (items: CartItemView[]): number =>
    items.reduce((c, it) => c + Number(it.qty || 0), 0)
);
