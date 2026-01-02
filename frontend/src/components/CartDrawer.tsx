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

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);

  /** 折扣碼輸入框文字 */
  const [discountInput, setDiscountInput] = useState("");

  /** 是否已成功套用折扣 */
  const [discountApplied, setDiscountApplied] = useState(false);

  /* ================= 金額計算 ================= */

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const tax = subtotal * 0.1;
  const discount = discountApplied ? DISCOUNT_AMOUNT : 0;
  const total = Math.max(subtotal + tax - discount, 0);

  /* ================= 鎖背景滾動 ================= */

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  /* ================= 折扣套用 ================= */

  const handleApplyDiscount = () => {
    if (discountInput.trim().toUpperCase() === DISCOUNT_CODE) {
      setDiscountApplied(true);
    } else {
      setDiscountApplied(false);
    }
  };

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
                {/* Top row */}
                <div className="drawer-item-top">
                  <span className="drawer-item-name">
                    {item.product.title}
                  </span>
                  <span className="drawer-item-price">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* Bottom row */}
                <div className="drawer-item-bottom">
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
                  </div>

                  <span
                    className="drawer-remove"
                    onClick={() =>
                      dispatch(
                        removeFromCart(item.product.id)
                      )
                    }
                  >
                    Remove
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ================= Footer ================= */}
        <footer className="drawer-footer">
          {/* ===== Discount ===== */}
          <div className="drawer-discount">
            <label>Apply Discount Code</label>

            <div className="drawer-discount-row">
              <input
                value={discountInput}
                onChange={(e) =>
                  setDiscountInput(e.target.value)
                }
              />

              <button onClick={handleApplyDiscount}>
                Apply
              </button>
            </div>
          </div>

          {/* ===== Summary ===== */}
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
                <span>- ${DISCOUNT_AMOUNT.toFixed(2)}</span>
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
