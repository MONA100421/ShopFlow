import { Outlet, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function MainLayout() {
  const { items } = useCart();
  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      <header>
        <Link to="/cart" className="cart-icon">
          🛒
          {totalQuantity > 0 && (
            <span className="cart-badge">{totalQuantity}</span>
          )}
        </Link>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>Footer</footer>
    </>
  );
}
