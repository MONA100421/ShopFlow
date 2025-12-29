import { useCart } from "../context/CartContext";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    tax,
    discount,
    total,
    applyDiscountCode,
    error,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="cart-page">
          <p>Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="cart-page">
        {/* =======================
            Left: Cart Items
        ======================= */}
        <div className="cart-items">
          <div className="cart-header">
            <h1 className="cart-title">Shopping Cart</h1>
            <span className="cart-count">
              {items.length} item{items.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="cart-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                {/* Image */}
                <div className="cart-item-image">
                  <img
                    src={item.image}
                    alt={item.name}
                  />
                </div>

                {/* Info */}
                <div className="cart-item-info">
                  <div className="cart-item-title">
                    {item.name}
                  </div>

                  <div className="cart-item-price">
                    ${item.price.toFixed(2)}
                  </div>

                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>

                {/* Quantity */}
                <div className="cart-item-quantity">
                  <button
                    type="button"
                    className="decrease"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>

                  <span className="quantity-value">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    className="increase"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =======================
            Right: Summary
        ======================= */}
        <div className="cart-summary">
          <h2 className="summary-title">
            Order Summary
          </h2>

          <div className="summary-row subtotal">
            <span className="label">Subtotal</span>
            <span className="value">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="summary-row shipping">
            <span className="label">Tax</span>
            <span className="value">
              ${tax.toFixed(2)}
            </span>
          </div>

          <div className="summary-row discount">
            <span className="label">Discount</span>
            <span className="value">
              -${discount.toFixed(2)}
            </span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total">
            <span className="label">Total</span>
            <span className="value">
              ${total.toFixed(2)}
            </span>
          </div>

          <input
            type="text"
            className="discount-input"
            placeholder="Discount Code"
            onBlur={(e) =>
              applyDiscountCode(e.target.value)
            }
          />

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button
            type="button"
            className="checkout-btn"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
