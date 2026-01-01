// src/layouts/MainLayout.tsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { logout } from "../store/authSlice";
import CartDrawer from "../components/CartDrawer";

export default function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // ===== Auth state =====
  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // ===== Cart state =====
  const items = useSelector(
    (state: RootState) => state.cart.items
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <div className="app">
      {/* ================= Header ================= */}
      <header className="site-header">
        <div className="container header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo">
            Management <span>Chuwa</span>
          </Link>

          {/* Search */}
          <div className="header-search">
            <input type="text" placeholder="Search" />
          </div>

          {/* Right Actions */}
          <div className="header-actions">
            {!isAuthenticated ? (
              <Link
                to="/auth/login"
                className={`header-btn ${loading ? "disabled" : ""}`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Link>
            ) : (
              <button
                className="header-btn"
                onClick={handleLogout}
                disabled={loading}
              >
                Sign Out
              </button>
            )}

            <button
              className="cart-btn"
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

      {/* ================= Global Auth Error ================= */}
      {error && (
        <div className="global-error">
          {error}
        </div>
      )}

      {/* ================= Main ================= */}
      <main className="site-main">
        {/* 
          IMPORTANT:
          This is the ONLY container that pages should live in.
          Pages must NOT define their own `.container`.
        */}
        <div className="container">
          <Outlet context={{ setCartOpen }} />
        </div>
      </main>

      {/* ================= Footer ================= */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <span>© 2022 All Rights Reserved.</span>
          <div className="footer-links">
            <a href="#">Contact us</a>
            <a href="#">Privacy Policies</a>
            <a href="#">Help</a>
          </div>
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
