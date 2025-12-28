import { useStore } from "../state/StoreContext";

export default function Cart() {
  const {
    cartItems,
    setQty,
    removeFromCart,
    clearCart,
    promo,
    setPromo,
    subtotal,
    tax,
    discount,
    total,
  } = useStore();

  return (
    <div className="page cart-page">
      <div className="cart-head">
        <h1>Cart ({cartItems.reduce((s, it) => s + it.qty, 0)})</h1>
        <button className="btn" onClick={clearCart}>
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
                  <button className="btn" onClick={() => setQty(it.id, it.qty - 1)}>
                    −
                  </button>
                  <div className="qty-box">{it.qty}</div>
                  <button className="btn" onClick={() => setQty(it.id, it.qty + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className="cart-right">
                <div className="cart-price">${it.price.toFixed(2)}</div>
                <button className="link" onClick={() => removeFromCart(it.id)}>
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
                onChange={(e) => setPromo(e.target.value)}
                placeholder="SAVE20 or SAVE10"
              />
              <button className="btn primary" onClick={() => setPromo(promo)}>
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
