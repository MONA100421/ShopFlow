import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setQty, removeFromCart, setPromo } from "../redux/slices/cartSlice";
import "./CartDrawer.css";

export default function CartDrawer({ open, onClose }) {
  const dispatch = useDispatch();

  // ✅ Redux state
  const cart = useSelector((s) => s.cart?.items || {});        // { [id]: qty }
  const promo = useSelector((s) => s.cart?.promo || "");
  const products = useSelector((s) => s.products?.items || []);

  // ✅ join: cart + products => cartItems（和你 Cart.jsx / LayoutShell 的逻辑一致）
  const cartItems = useMemo(() => {
    const byId = new Map(products.map((p) => [String(p._id || p.id), p]));
    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = byId.get(String(id));
        if (!p) return null;
        const pid = String(p._id || p.id);
        const q = Number(qty || 0);
        return {
          ...p,
          id: pid,
          qty: q,
          image: p.image || "https://via.placeholder.com/120?text=No+Image",
          lineTotal: Number(p.price || 0) * q,
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  const count = useMemo(
    () => cartItems.reduce((s, it) => s + Number(it.qty || 0), 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + Number(it.lineTotal || 0), 0),
    [cartItems]
  );

  // ✅ 复刻旧 StoreContext：tax = 10%
  const taxRate = 0.1;
  const tax = useMemo(() => subtotal * taxRate, [subtotal]);

  // ✅ 复刻旧 StoreContext：SAVE10 / SAVE20（不超过 subtotal）
  const discount = useMemo(() => {
    const code = String(promo || "").trim().toUpperCase();
    if (code === "SAVE10") return Math.min(10, subtotal);
    if (code === "SAVE20") return Math.min(20, subtotal);
    return 0;
  }, [promo, subtotal]);

  const total = useMemo(() => subtotal + tax - discount, [subtotal, tax, discount]);

  if (!open) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-head">
          <div className="cart-title">
            Cart <span className="cart-count">({count})</span>
          </div>
          <button className="cart-x" onClick={onClose} aria-label="close">
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 && <div className="muted">Cart is empty.</div>}

          {cartItems.map((it) => (
            <div className="cart-item" key={it.id}>
              <img className="cart-item-img" src={it.image} alt={it.name} />

              <div className="cart-item-mid">
                <div className="cart-item-name">{it.name}</div>

                <div className="cart-qty">
                  <button
                    className="qty-btn"
                    onClick={() =>
                      dispatch(setQty({ id: it.id, qty: Math.max(0, it.qty - 1) }))
                    }
                  >
                    −
                  </button>
                  <div className="qty-box">{it.qty}</div>
                  <button
                    className="qty-btn"
                    onClick={() => dispatch(setQty({ id: it.id, qty: it.qty + 1 }))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-right">
                <div className="cart-item-price">${Number(it.price || 0).toFixed(2)}</div>
                <button className="cart-remove" onClick={() => dispatch(removeFromCart(it.id))}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-promo">
            <div className="cart-promo-title">Apply Discount Code</div>
            <div className="cart-promo-row">
              <input
                className="cart-input"
                value={promo}
                onChange={(e) => dispatch(setPromo(e.target.value))}
                placeholder="SAVE20 or SAVE10"
              />
              {/* 你旧版这个按钮没干活，我这里让它真正 Apply（UI 不变） */}
              <button className="cart-apply" onClick={() => dispatch(setPromo(promo))}>
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
