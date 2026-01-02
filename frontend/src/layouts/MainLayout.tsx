// src/layouts/MainLayout.tsx
import { Outlet, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { logout } from "../store/authSlice";
import CartDrawer from "../components/CartDrawer";

import searchIcon from "../assets/magnifier.svg";

export default function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const items = useSelector((state: RootState) => state.cart.items);
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const handleSearchChange = (value: string) => {
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo">
            Management <span>Chuwa</span>
          </Link>

          {/* Search */}
          <div className="header-search">
            <div className="search-input-wrapper">
              <input
                className="search-input"
                type="text"
                placeholder="Search"
                value={searchParams.get("q") ?? ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <img
                src={searchIcon}
                alt="Search"
                className="search-icon"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="header-actions">
            {!isAuthenticated ? (
              <Link to="/auth/login" className="header-btn">
                Sign In
              </Link>
            ) : (
              <button className="header-btn" onClick={handleLogout}>
                Sign Out
              </button>
            )}

            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              🛒
              {totalQuantity > 0 && (
                <span className="cart-badge">{totalQuantity}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {error && <div className="global-error">{error}</div>}

      <main className="site-main">
        <div className="container">
          <Outlet context={{ setCartOpen }} />
        </div>
      </main>

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

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
