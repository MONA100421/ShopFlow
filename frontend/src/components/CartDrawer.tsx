import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "../store/store";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
} from "../store/cartSlice";
import "./CartDrawer.css";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= Header ================= */}
        <header className="drawer-header">
          <h2 className="drawer-title">Cart ({items.length})</h2>
          <button className="drawer-close" onClick={onClose}>
            ✕
          </button>
        </header>

        {/* ================= Items ================= */}
        <section className="drawer-items">
          {items.length === 0 && (
            <div className="drawer-empty">Your cart is empty</div>
          )}

          {items.map((item) => (
            <div key={item.product.id} className="drawer-item">
              {/* Image */}
              {item.product.image && (
                <img
                  src={item.product.image}
                  alt={item.product.title}
                />
              )}

              {/* Info */}
              <div className="drawer-item-info">
                <div className="drawer-item-name">
                  {item.product.title}
                </div>

                <div className="drawer-item-actions">
                  <button
                    onClick={() =>
                      dispatch(
                        decreaseQuantity(item.product.id)
                      )
                    }
                  >
                    −
                  </button>

                  <span className="drawer-qty">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      dispatch(
                        increaseQuantity(item.product.id)
                      )
                    }
                  >
                    +
                  </button>

                  <button
                    className="drawer-remove"
                    onClick={() =>
                      dispatch(
                        removeFromCart(item.product.id)
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="drawer-item-price">
                $
                {(item.product.price * item.quantity).toFixed(
                  2
                )}
              </div>
            </div>
          ))}
        </section>

        {/* ================= Footer ================= */}
        <footer className="drawer-footer">
          <div className="drawer-summary">
            <div>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="drawer-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button className="drawer-checkout-btn">
            Continue to checkout
          </button>
        </footer>
      </aside>
    </div>
  );
}
