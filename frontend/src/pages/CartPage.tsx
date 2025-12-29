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
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Shopping Cart</h1>

      {/* Cart Items */}
      {items.map((item) => (
        <div key={item.id} className="cart-item">
          <img src={item.image} alt={item.name} width={80} />

          <div>{item.name}</div>
          <div>${item.price}</div>

          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.id, Number(e.target.value))
            }
          />

          <button onClick={() => removeFromCart(item.id)}>
            Remove
          </button>
        </div>
      ))}

      {/* Summary */}
      <div className="summary">
        <div>Subtotal: ${subtotal.toFixed(2)}</div>
        <div>Tax: ${tax.toFixed(2)}</div>
        <div>Discount: -${discount.toFixed(2)}</div>
        <h3>Total: ${total.toFixed(2)}</h3>
      </div>

      {/* Discount Code */}
      <input
        placeholder="Discount Code"
        onBlur={(e) => applyDiscountCode(e.target.value)}
      />

      {error && <p className="error">{error}</p>}
    </div>
  );
}
