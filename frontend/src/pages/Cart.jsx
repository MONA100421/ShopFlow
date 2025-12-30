import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setQty, removeFromCart, clearCart, setPromo } from "../redux/slices/cartSlice";

export default function Cart() {
  const dispatch = useDispatch();

  // 1) 从 Redux 读数据
  const cart = useSelector((s) => s.cart?.items || {}); // { [id]: qty }
  const promo = useSelector((s) => s.cart?.promo || "");
  const products = useSelector((s) => s.products?.items || []);

  // 2) join：cart + products => cartItems（完全复刻你旧 StoreContext）
  const cartItems = useMemo(() => {
    const byId = new Map(products.map((p) => [String(p._id || p.id), p]));

    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = byId.get(String(id));
        if (!p) return null; // products 还没加载完时先跳过
        const pid = String(p._id || p.id);

        return {
          ...p,
          id: pid,
          qty: Number(qty || 0),
          lineTotal: Number(p.price || 0) * Number(qty || 0),
          image: p.image || "https://via.placeholder.com/120?text=No+Image",
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartCount = useMemo(
    () => cartItems.reduce((s, it) => s + Number(it.qty || 0), 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + Number(it.lineTotal || 0), 0),
    [cartItems]
  );

  // ✅ 复刻旧逻辑：taxRate = 0.1
  const taxRate = 0.1;
  const tax = useMemo(() => +(subtotal * taxRate).toFixed(2), [subtotal]);

  // ✅ 复刻旧逻辑：SAVE10 减 $10；SAVE20 减 $20；都不超过 subtotal
  const discount = useMemo(() => {
    const code = String(promo || "").trim().toUpperCase();
    if (!code) return 0;
    if (code === "SAVE10") return Math.min(10, subtotal);
    if (code === "SAVE20") return Math.min(20, subtotal);
    return 0;
  }, [promo, subtotal]);

  const total = useMemo(() => +(subtotal + tax - discount).toFixed(2), [subtotal, tax, discount]);

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
          {cartItems.length === 0 && <div className="muted">Cart is empty.</div>}

          {cartItems.map((it) => (
            <div className="cart-row" key={it.id}>
              <img className="cart-thumb" src={it.image} alt={it.name} />
              <div className="cart-mid">
                <div className="cart-name">{it.name}</div>
                <div className="qty">
                  <button
                    className="btn"
                    onClick={() =>
                      dispatch(setQty({ id: it.id, qty: Math.max(0, Number(it.qty || 0) - 1) }))
                    }
                  >
                    −
                  </button>
                  <div className="qty-box">{it.qty}</div>
                  <button
                    className="btn"
                    onClick={() =>
                      dispatch(setQty({ id: it.id, qty: Number(it.qty || 0) + 1 }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-right">
                <div className="cart-price">${Number(it.price || 0).toFixed(2)}</div>
                <button className="link" onClick={() => dispatch(removeFromCart(it.id))}>
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
                value={promo}
                onChange={(e) => dispatch(setPromo(e.target.value))}
                placeholder="SAVE20 or SAVE10"
              />
              <button className="btn primary" onClick={() => dispatch(setPromo(promo))}>
                Apply
              </button>
            </div>
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

          <button className="btn primary full" disabled={cartItems.length === 0}>
            Continue to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
