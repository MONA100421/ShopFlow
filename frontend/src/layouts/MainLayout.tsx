import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import CartDrawer from "../components/CartDrawer";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const items = useSelector(
    (state: RootState) => state.cart.items
  );

  const totalQuantity = Object.values(items).reduce(
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
            <button
              className="cart-icon"
              onClick={() => setCartOpen(true)}
            >
              🛒
              {totalQuantity > 0 && (
                <span className="cart-badge">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================= Main ================= */}
      <main>
        <Outlet context={{ setCartOpen }} />
      </main>

      {/* ================= Footer ================= */}
      <footer>
        <div className="footer-inner">
          <span>© 2025 All Rights Reserved.</span>
        </div>
      </footer>

      {/* ================= Cart Drawer ================= */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </div>
  );
}
