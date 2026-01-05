import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setQty, removeFromCart, setPromo } from "../redux/slices/cartSlice";
import "./CartDrawer.css";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

type Product = {
  _id?: string;
  id?: string;
  name?: string;
  image?: string;
  price?: number | string;
  // 允许其它字段存在
  [k: string]: unknown;
};

type CartState = {
  items?: Record<string, number>;
  promo?: string;
};

type ProductsState = {
  items?: Product[];
};

type RootStateLike = {
  cart?: CartState;
  products?: ProductsState;
};

type CartItem = Product & {
  id: string; // 统一后的产品 id
  qty: number;
  image: string;
  lineTotal: number;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const dispatch = useDispatch<any>(); // ✅ 先放开 thunk/action 类型（后续统一做 AppDispatch）

  // ✅ Redux state
  const cart = useSelector((s: RootStateLike) => s.cart?.items || {}); // { [id]: qty }
  const promo = useSelector((s: RootStateLike) => s.cart?.promo || "");
  const products = useSelector((s: RootStateLike) => s.products?.items || []);

  // ✅ join: cart + products => cartItems
  const cartItems: CartItem[] = useMemo(() => {
    const byId = new Map<string, Product>(
      products.map((p) => [String(p._id || p.id), p])
    );

    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = byId.get(String(id));
        if (!p) return null;

        const pid = String(p._id || p.id);
        const q = Number(qty || 0);
        const priceNum = Number(p.price || 0);

        const item: CartItem = {
          ...p,
          id: pid,
          qty: q,
          image: String(
            p.image || "https://via.placeholder.com/120?text=No+Image"
          ),
          lineTotal: priceNum * q,
        };
        return item;
      })
      .filter((x): x is CartItem => Boolean(x));
  }, [cart, products]);

  const count = useMemo(
    () => cartItems.reduce((s, it) => s + Number(it.qty || 0), 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + Number(it.lineTotal || 0), 0),
    [cartItems]
  );

  // ✅ tax = 10%
  const taxRate = 0.1;
  const tax = useMemo(() => subtotal * taxRate, [subtotal]);

  // ✅ SAVE10 / SAVE20（不超过 subtotal）
  const discount = useMemo(() => {
    const code = String(promo || "")
      .trim()
      .toUpperCase();
    if (code === "SAVE10") return Math.min(10, subtotal);
    if (code === "SAVE20") return Math.min(20, subtotal);
    return 0;
  }, [promo, subtotal]);

  const total = useMemo(
    () => subtotal + tax - discount,
    [subtotal, tax, discount]
  );

  if (!open) return null;

return (
  <div className="cart-overlay" onClick={onClose}>
    <aside
      className="cart-drawer"
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <div className="cart-drawer-head">
        <div className="cart-title">
          Cart <span className="cart-count">({count})</span>
        </div>
        <button className="cart-x" onClick={onClose} aria-label="close">
          ✕
        </button>
      </div>

      {/* ✅ 唯一滚动区域：商品列表 */}
      <div className="cart-drawer-body">
        {cartItems.length === 0 && <div className="muted">Cart is empty.</div>}

        {cartItems.map((it) => {
          // ✅ 从 merged 的 product 字段里读库存（cartSelectors.ts 已经把 product spread 进来了）
          const stockNum = Number((it as any)?.stock ?? NaN);
          const hasStock = Number.isFinite(stockNum);
          const cap = hasStock ? Math.max(0, stockNum) : Infinity;

          const outOfStock = hasStock ? cap <= 0 : false;
          const atCap = hasStock ? it.qty >= cap : false;

          return (
            <div className="cart-item" key={it.id}>
              <img
                className="cart-item-img"
                src={it.image}
                alt={String(it.name || "")}
              />

              <div className="cart-item-mid">
                <div className="cart-item-name">{it.name}</div>

                <div className="cart-item-qty">
                  <button
                    className="qty-btn"
                    type="button"
                    onClick={() =>
                      dispatch(
                        setQty({ id: it.id, qty: Math.max(1, it.qty - 1) })
                      )
                    }
                    disabled={it.qty <= 1}
                  >
                    –
                  </button>

                  <span className="qty-num">{it.qty}</span>

                  <button
                    className="qty-btn"
                    type="button"
                    // ✅ 到库存上限 or 缺货：购物车里也禁用 +
                    disabled={outOfStock || atCap}
                    onClick={() => {
                      if (outOfStock || atCap) return;
                      const next = hasStock ? Math.min(cap, it.qty + 1) : it.qty + 1;
                      dispatch(setQty({ id: it.id, qty: next }));
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-right">
                <div className="cart-item-price">
                  ${(Number(it.price || 0) * it.qty).toFixed(2)}
                </div>
                <button
                  className="link"
                  type="button"
                  onClick={() => dispatch(removeFromCart(it.id))}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ 固定底部区域：Promo + Summary + Checkout */}
      <div className="cart-drawer-footer">
        <div className="cart-promo">
          <div className="cart-promo-title">Apply Discount Code</div>
          <div className="cart-promo-row">
            <input
              className="cart-input"
              value={promo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                dispatch(setPromo(e.target.value))
              }
              placeholder=""
            />
            <button
              className="cart-apply"
              type="button"
              onClick={() => dispatch(setPromo(promo))}
            >
              Apply
            </button>
          </div>
        </div>

        <div className="cart-summary">
          <div className="sum-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="sum-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="sum-row">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
          <div className="sum-row total">
            <span>Estimated total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button className="cart-checkout" disabled={cartItems.length === 0}>
            Continue to checkout
          </button>
        </div>
      </div>
    </aside>
  </div>
);
}