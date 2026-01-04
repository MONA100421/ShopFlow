import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
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

const DISCOUNT_CODE = "20 DOLLAR OFF";
const DISCOUNT_AMOUNT = 20;

export default function CartDrawer({
  open,
  onClose,
}: CartDrawerProps) {
  /* ================= Redux ================= */

  const dispatch = useDispatch();
  const items = useSelector(
    (state: RootState) => state.cart.items
  );

  /* ================= Local State ================= */

  const [discountInput, setDiscountInput] = useState("");
  const [discountApplied, setDiscountApplied] =
    useState(false);

  /* ================= Price Calculation ================= */

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const tax = subtotal * 0.1;
  const discount = discountApplied ? DISCOUNT_AMOUNT : 0;
  const total = Math.max(subtotal + tax - discount, 0);

  /* ================= Scroll Control (🔥 SAFE) ================= */

  useEffect(() => {
    if (open) {
      /* 只鎖 Y 軸，避免手機 Safari 永久鎖死 */
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [open]);

  if (!open) return null;

  /* ================= Discount ================= */

  const handleApplyDiscount = () => {
    if (
      discountInput.trim().toUpperCase() === DISCOUNT_CODE
    ) {
      setDiscountApplied(true);
    } else {
      setDiscountApplied(false);
    }
  };

  /* ================= Render ================= */

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= Header ================= */}
        <header className="drawer-header">
          <h2 className="drawer-title">
            Cart ({items.length})
          </h2>
          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        {/* ================= Items ================= */}
        <section className="drawer-items">
          {items.length === 0 && (
            <div className="drawer-empty">
              Your cart is empty
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.product.id}
              className="drawer-item"
            >
              {/* Thumbnail */}
              {item.product.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.title}
                />
              ) : (
                <div className="drawer-item-img placeholder">
                  No Image
                </div>
              )}

              {/* Content */}
              <div className="drawer-item-content">
                {/* Top */}
                <div className="drawer-item-top">
                  <span className="drawer-item-name">
                    {item.product.title}
                  </span>
                  <span className="drawer-item-price">
                    $
                    {(
                      item.product.price * item.quantity
                    ).toFixed(2)}
                  </span>
                </div>

                {/* Bottom */}
                <div className="drawer-item-bottom">
                  <div className="drawer-item-actions">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          decreaseQuantity(
                            item.product.id
                          )
                        )
                      }
                    >
                      −
                    </button>

                    <span className="drawer-qty">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          increaseQuantity(
                            item.product.id
                          )
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="drawer-remove"
                    onClick={() =>
                      dispatch(
                        removeFromCart(
                          item.product.id
                        )
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ================= Footer ================= */}
        <footer className="drawer-footer">
          {/* Discount */}
          <div className="drawer-discount">
            <label>Apply Discount Code</label>

            <div className="drawer-discount-row">
              <input
                value={discountInput}
                onChange={(e) =>
                  setDiscountInput(e.target.value)
                }
                placeholder="Enter code"
              />

              <button
                type="button"
                onClick={handleApplyDiscount}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="drawer-summary">
            <div>
              <span>Subtotal</span>
              <span>
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div>
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            {discountApplied && (
              <div>
                <span>Discount</span>
                <span>
                  - $
                  {DISCOUNT_AMOUNT.toFixed(2)}
                </span>
              </div>
            )}

            <div className="drawer-total">
              <span>Estimated total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            className="drawer-checkout-btn"
          >
            Continue to checkout
          </button>
        </footer>
      </aside>
    </div>
  );
}
