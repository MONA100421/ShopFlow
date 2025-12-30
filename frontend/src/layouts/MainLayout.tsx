import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { logout } from "../store/authSlice";
import CartDrawer from "../components/CartDrawer";

export default function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ================= Auth (Redux ONLY) ================= */
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  /* ================= Cart ================= */
  const items = useSelector(
    (state: RootState) => state.cart.items
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login"); // 🔥 登出後回到登入頁
  };

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
              <button
                className="header-btn"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth/login"
                className="header-btn"
              >
                Sign In
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
