import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import type { RootState, AppDispatch } from "../store/store";
import {
  updateQuantityThunk,
  removeFromCartThunk,
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
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(
    (state: RootState) => state.cart.items
  );

  const [discountInput, setDiscountInput] = useState("");
  const [discountApplied, setDiscountApplied] =
    useState(false);

  const subtotal = items.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  const tax = subtotal * 0.1;
  const discount = discountApplied ? DISCOUNT_AMOUNT : 0;
  const total = Math.max(subtotal + tax - discount, 0);

  useEffect(() => {
    document.body.style.overflowY = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [open]);

  if (!open) return null;

  const handleApplyDiscount = () => {
    setDiscountApplied(
      discountInput.trim().toUpperCase() === DISCOUNT_CODE
    );
  };

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
            type="button"
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
            <div
              key={item._id}
              className="drawer-item"
            >
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

              <div className="drawer-item-content">
                <div className="drawer-item-top">
                  <span className="drawer-item-name">
                    {item.product.title}
                  </span>
                  <span className="drawer-item-price">
                    $
                    {(
                      item.product.price *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="drawer-item-bottom">
                  <div className="drawer-item-actions">
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantityThunk({
                            productId:
                              item.product._id,
                            delta: -1,
                          })
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
                          updateQuantityThunk({
                            productId:
                              item.product._id,
                            delta: 1,
                          })
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="drawer-remove"
                    onClick={() =>
                      dispatch(
                        removeFromCartThunk(
                          item.product._id
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

        {/* Footer */}
        <footer className="drawer-footer">
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
              <button onClick={handleApplyDiscount}>
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
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            {discountApplied && (
              <div>
                <span>Discount</span>
                <span>
                  - ${DISCOUNT_AMOUNT.toFixed(2)}
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
