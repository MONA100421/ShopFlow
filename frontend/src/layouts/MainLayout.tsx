import {
  Outlet,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import type { RootState, AppDispatch } from "../store/store";
import { logout } from "../store/authSlice";
import { fetchCartThunk } from "../store/cartSlice";

import CartDrawer from "../components/CartDrawer";

import searchIcon from "../assets/magnifier.svg";
import userIcon from "../assets/carbon_user-certification.svg";
import cartIcon from "../assets/carbon_shopping-cart.svg";
import youtubeIcon from "../assets/youtube.svg";
import twitterIcon from "../assets/twitter.svg";
import facebookIcon from "../assets/facebook.svg";

export default function MainLayout() {
  /* ================= Local UI State ================= */
  const [cartOpen, setCartOpen] = useState(false);

  /* ================= Hooks ================= */
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ================= Redux ================= */
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const { items, initialized } = useSelector(
    (state: RootState) => state.cart
  );

  /* =================================================
     ✅ 初始化 Cart（只做一次）
     - 重新整理頁面也能拿到 cart
  ================================================= */
  useEffect(() => {
    if (!initialized) {
      dispatch(fetchCartThunk());
    }
  }, [dispatch, initialized]);

  /* ================= Search (IME Safe) ================= */
  const [value, setValue] = useState(searchParams.get("q") || "");
  const [isComposing, setIsComposing] = useState(false);

  const commitSearch = (v: string) => {
    navigate(v ? `/?q=${encodeURIComponent(v)}` : "/");
  };

  /* ================= Auth ================= */
  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  /* ================= Cart Summary ================= */
  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="app">
      {/* ================= Header ================= */}
      <header className="site-header">
        <div className="container header-inner">
          {/* ===== Logo ===== */}
          <Link
            to="/"
            className="header-logo header-logo-full"
          >
            Management <span>Chuwa</span>
          </Link>

          <Link
            to="/"
            className="header-logo header-logo-short"
          >
            <span className="logo-m">M</span>
            <span className="logo-text">Chuwa</span>
          </Link>

          {/* ===== Search ===== */}
          <div className="header-search">
            <div className="search-input-wrapper">
              <input
                className="search-input"
                placeholder="Search"
                value={value}
                onCompositionStart={() =>
                  setIsComposing(true)
                }
                onCompositionEnd={(e) => {
                  setIsComposing(false);
                  const v = e.currentTarget.value;
                  setValue(v);
                  commitSearch(v);
                }}
                onChange={(e) => {
                  const v = e.target.value;
                  setValue(v);
                  if (isComposing) return;
                  commitSearch(v);
                }}
              />
              <img
                src={searchIcon}
                alt="Search"
                className="search-icon"
              />
            </div>
          </div>

          {/* ===== Right Actions ===== */}
          <div className="header-actions">
            {/* ---------- User ---------- */}
            {!isAuthenticated ? (
              <Link
                to="/auth/login"
                className="header-user"
              >
                <img
                  src={userIcon}
                  alt="user"
                  className="user-icon"
                />
                <span>Sign In</span>
              </Link>
            ) : (
              <button
                type="button"
                className="header-user"
                onClick={handleLogout}
              >
                <img
                  src={userIcon}
                  alt="user"
                  className="user-icon"
                />
                <span>Sign Out</span>
              </button>
            )}

            {/* ---------- Cart ---------- */}
            <button
              type="button"
              className="header-cart"
              onClick={() => setCartOpen(true)}
            >
              <span className="cart-icon-wrapper">
                <img
                  src={cartIcon}
                  alt="Cart"
                  className="cart-icon"
                />
                {totalQuantity > 0 && (
                  <span className="cart-badge">
                    {totalQuantity}
                  </span>
                )}
              </span>

              <span className="cart-total">
                ${totalPrice.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= Main ================= */}
      <main className="site-main">
        <div className="container">
          <Outlet context={{ setCartOpen }} />
        </div>
      </main>

      {/* ================= Footer ================= */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <span className="footer-left">
            © 2022 All Rights Reserved.
          </span>

          <div className="footer-social">
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={youtubeIcon}
                alt="YouTube"
              />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={twitterIcon}
                alt="Twitter"
              />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={facebookIcon}
                alt="Facebook"
              />
            </a>
          </div>

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
