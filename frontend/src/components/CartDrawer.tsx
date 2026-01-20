import { useSelector } from "react-redux";
import { useEffect } from "react";

import type { RootState } from "../store/store";
import { useCartTotal } from "../hooks/useCartTotal";

import CartDrawerItem from "./CartDrawerItem";
import "./CartDrawer.css";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({
  open,
  onClose,
}: CartDrawerProps) {
  const items = useSelector(
    (state: RootState) => state.cart.items
  );

  const {
    subtotal,
    tax,
    discount,
    total,
    discountInput,
    setDiscountInput,
    discountApplied,
    applyDiscount,
  } = useCartTotal();

  useEffect(() => {
    document.body.style.overflowY = open
      ? "hidden"
      : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="drawer-header">
          <h2 className="drawer-title">
            Cart ({items.length})
          </h2>
          <button
            className="drawer-close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        {/* Items */}
        <section className="drawer-items">
          {items.length === 0 && (
            <div className="drawer-empty">
              Your cart is empty
            </div>
          )}

          {items.map((item) => (
            <CartDrawerItem
              key={item.productId}
              item={item}
            />
          ))}
        </section>

        {/* Footer */}
        <footer className="drawer-footer">
          <div className="drawer-discount">
            <label htmlFor="discount-code">Apply Discount Code</label>
            <div className="drawer-discount-row">
              <input
                id="discount-code"
                name="discountCode"
                value={discountInput}
                onChange={(e) =>
                  setDiscountInput(e.target.value)
                }
                placeholder="Enter code"
              />
              <button onClick={applyDiscount}>
                Apply
              </button>
            </div>
          </div>

          <div className="drawer-summary">
            <div>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            {discountApplied && (
              <div>
                <span>Discount</span>
                <span>
                  - ${discount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="drawer-total">
              <span>Estimated total</span>
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
