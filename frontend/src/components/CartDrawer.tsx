import ProductImage from "./ProductImage";
import QuantityButton from "./QuantityButton";
import { useSelector } from "react-redux";
import { useEffect } from "react";

import type { RootState } from "../store/store";
import type { Product } from "../types/Product";
import { useCartItem } from "../hooks/useCartItem";
import { useCartTotal } from "../hooks/useCartTotal";

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

  /* ================= Cart Total Hook ================= */
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

  /* ================= Effects ================= */
  useEffect(() => {
    document.body.style.overflowY = open
      ? "hidden"
      : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [open]);

  if (!open) return null;

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

          {items.map((item) => {
            const product = {
              id: item.productId,
              title: item.name,
              price: item.price,
              image: item.imageUrl,
              stock: Infinity,
            } as Product;

            const {
              quantity,
              add,
              increase,
              decrease,
            } = useCartItem(product);

            return (
              <div
                key={item.productId}
                className="drawer-item"
              >
                <div className="drawer-item-image">
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.name}
                  />
                </div>

                <div className="drawer-item-content">
                  <div className="drawer-item-top">
                    <span className="drawer-item-name">
                      {item.name}
                    </span>
                    <span className="drawer-item-price">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="drawer-item-bottom">
                    <QuantityButton
                      quantity={quantity}
                      onAdd={add}
                      onIncrease={increase}
                      onDecrease={decrease}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ================= Footer ================= */}
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
