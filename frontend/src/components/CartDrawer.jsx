import { useStore } from "../state/StoreContext";
import "./CartDrawer.css";

export default function CartDrawer({ open, onClose }) {
  const {
    cartItems,
    setQty,
    removeFromCart,
    promo,
    setPromo,
    subtotal,
    tax,
    discount,
    total,
  } = useStore();

  if (!open) return null;

  const count = cartItems.reduce((s, it) => s + it.qty, 0);

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
                  <button className="qty-btn" onClick={() => setQty(it.id, it.qty - 1)}>
                    −
                  </button>
                  <div className="qty-box">{it.qty}</div>
                  <button className="qty-btn" onClick={() => setQty(it.id, it.qty + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-right">
                <div className="cart-item-price">${it.price.toFixed(2)}</div>
                <button className="cart-remove" onClick={() => removeFromCart(it.id)}>
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
                onChange={(e) => setPromo(e.target.value)}
                placeholder="SAVE20 or SAVE10"
              />
              <button className="cart-apply">Apply</button>
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
