import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";

import {
  setQty,
  removeFromCart,
  clearCart,
  setPromo,
} from "../redux/slices/cartSlice";

// --- 类型（按你现在的用法做“宽松但够用”的 TS 类型） ---
type ProductLike = {
  _id?: string;
  id?: string;
  name?: string;
  price?: number | string;
  image?: string;
  [k: string]: any; // 允许产品对象还有其他字段
};

type CartItemsMap = Record<string, number>;

type CartItemView = ProductLike & {
  id: string; // 统一后的 id
  qty: number;
  lineTotal: number;
  image: string;
};

export default function Cart() {
  // ✅ 原生 react-redux + 显式类型（否则 thunk/dispatch 类型会不准）
  const dispatch = useDispatch<AppDispatch>();

  // ✅ 显式 RootState（否则 s 是 unknown）
  const cart: CartItemsMap = useSelector(
    (s: RootState) => (s.cart?.items as CartItemsMap) || {}
  );
  const promo = useSelector((s: RootState) => s.cart?.promo || "");
  const products: ProductLike[] = useSelector(
    (s: RootState) => (s.products?.items as ProductLike[]) || []
  );

  // （可选）本地输入框状态：避免每打一个字就写 redux（体验更好）
  const [promoInput, setPromoInput] = useState(promo);

  // 2) join：cart + products => cartItems
  const cartItems: CartItemView[] = useMemo(() => {
    const byId = new Map<string, ProductLike>(
      products.map((p) => [String(p._id || p.id), p])
    );

    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = byId.get(String(id));
        if (!p) return null; // products 还没加载完时先跳过
        const pid = String(p._id || p.id);

        const priceNum = Number(p.price || 0);
        const qtyNum = Number(qty || 0);

        return {
          ...p,
          id: pid,
          qty: qtyNum,
          lineTotal: priceNum * qtyNum,
          image: p.image || "https://via.placeholder.com/120?text=No+Image",
        } as CartItemView;
      })
      .filter((x): x is CartItemView => Boolean(x));
  }, [cart, products]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, it) => sum + Number(it.qty || 0), 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, it) => sum + Number(it.lineTotal || 0), 0),
    [cartItems]
  );

  // ✅ taxRate = 0.1
  const taxRate = 0.1;
  const tax = useMemo(() => +(subtotal * taxRate).toFixed(2), [subtotal]);

  // ✅ SAVE10 减 $10；SAVE20 减 $20；都不超过 subtotal
  const discount = useMemo(() => {
    const code = String(promo || "")
      .trim()
      .toUpperCase();
    if (!code) return 0;
    if (code === "SAVE10") return Math.min(10, subtotal);
    if (code === "SAVE20") return Math.min(20, subtotal);
    return 0;
  }, [promo, subtotal]);

  const total = useMemo(
    () => +(subtotal + tax - discount).toFixed(2),
    [subtotal, tax, discount]
  );

  return (
    <div className="page cart-page">
      <div className="cart-head">
        <h1>Cart ({cartCount})</h1>
        <button className="btn" onClick={() => dispatch(clearCart())}>
          Clear
        </button>
      </div>

      <div className="cart-grid">
        <div className="cart-items">
          {cartItems.length === 0 && (
            <div className="muted">Cart is empty.</div>
          )}

          {cartItems.map((it) => (
            <div className="cart-row" key={it.id}>
              <img className="cart-thumb" src={it.image} alt={it.name || ""} />

              <div className="cart-mid">
                <div className="cart-name">{it.name}</div>

                <div className="qty">
                  <button
                    className="btn"
                    onClick={() =>
                      dispatch(
                        setQty({
                          id: it.id,
                          qty: Math.max(0, Number(it.qty || 0) - 1),
                        })
                      )
                    }
                  >
                    −
                  </button>

                  <div className="qty-box">{it.qty}</div>

                  <button
                    className="btn"
                    onClick={() =>
                      dispatch(
                        setQty({
                          id: it.id,
                          qty: Number(it.qty || 0) + 1,
                        })
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-right">
                <div className="cart-price">
                  ${Number(it.price || 0).toFixed(2)}
                </div>
                <button
                  className="link"
                  onClick={() => dispatch(removeFromCart(it.id))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="promo">
            <div className="promo-title">Apply Discount Code</div>

            <div className="promo-row">
              <input
                className="input"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="SAVE20 or SAVE10"
              />

              <button
                className="btn primary"
                onClick={() => dispatch(setPromo(promoInput))}
              >
                Apply
              </button>
            </div>

            {/* 同步提示：展示当前实际生效的 promo */}
            {promo && promo !== promoInput && (
              <div className="muted" style={{ marginTop: 8 }}>
                Applied: <b>{promo}</b>
              </div>
            )}
          </div>
        </div>

        <div className="summary">
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

          <button
            className="btn primary full"
            disabled={cartItems.length === 0}
          >
            Continue to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
