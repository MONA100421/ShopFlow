import { Outlet, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { items } = useCart();
  const { isAuthenticated, logout } = useAuth();

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="app">
      {/* ================= Header ================= */}
      <header>
        <div className="header-inner">
          {/* Logo */}
          <Link to="/" className="logo">
            Management Chuwa
          </Link>

          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            className="header-search"
          />

          {/* Actions */}
          <div className="header-actions">
            {/* Auth */}
            {isAuthenticated ? (
              <button onClick={logout} className="header-btn">
                Logout
              </button>
            ) : (
              <Link to="/login" className="header-btn">
                Login
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="cart-icon">
              🛒
              {totalQuantity > 0 && (
                <span className="cart-badge">
                  {totalQuantity}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ================= Main ================= */}
      <main>
        <Outlet />
      </main>

      {/* ================= Footer ================= */}
      <footer>
        <div className="footer-inner">
          <span>© 2025 All Rights Reserved.</span>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
            <a href="#">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
