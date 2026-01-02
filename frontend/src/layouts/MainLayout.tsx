import {
  Outlet,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { logout } from "../store/authSlice";
import CartDrawer from "../components/CartDrawer";

import searchIcon from "../assets/magnifier.svg";
import userIcon from "../assets/carbon_user-certification.svg";
import cartIcon from "../assets/carbon_shopping-cart.svg";

export default function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ===== Search state (中文輸入法安全) ===== */
  const [value, setValue] = useState(searchParams.get("q") || "");
  const [isComposing, setIsComposing] = useState(false);

  /* ===== Auth ===== */
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  /* ===== Cart ===== */
  const items = useSelector((state: RootState) => state.cart.items);

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );


  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const commitSearch = (v: string) => {
    navigate(v ? `/?q=${encodeURIComponent(v)}` : "/");
  };

  return (
    <div className="app">
      {/* ================= Header ================= */}
      <header className="site-header">
        <div className="container header-inner">
          {/* ===== Logo ===== */}
          <Link to="/" className="header-logo">
            Management <span>Chuwa</span>
          </Link>

          {/* ===== Search ===== */}
          <div className="header-search">
            <div className="search-input-wrapper">
              <input
                className="search-input"
                placeholder="Search"
                value={value}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(e) => {
                  setIsComposing(false);
                  const v = e.currentTarget.value;
                  setValue(v);
                  commitSearch(v); // 中文組字完成才搜尋
                }}
                onChange={(e) => {
                  const v = e.target.value;
                  setValue(v);
                  if (isComposing) return;
                  commitSearch(v); // 英文即時搜尋
                }}
              />
              <img
                src={searchIcon}
                alt="Search"
                className="search-icon"
              />
            </div>
          </div>

          {/* ===== Right Actions (Figma 對齊) ===== */}
          <div className="header-actions">
            {/* --- User --- */}
            {!isAuthenticated ? (
              <Link to="/auth/login" className="header-user">
                <img
                  src={userIcon}
                  alt="user"
                  className="user-icon"
                />
                <span>Sign In</span>
              </Link>
            ) : (
              <button
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

            {/* --- Cart --- */}
            <button className="header-cart" onClick={() => setCartOpen(true)}>
              <span className="cart-icon-wrapper">
                <img src={cartIcon} alt="Cart" className="cart-icon" />
                {totalQuantity > 0 && (
                  <span className="cart-badge">{totalQuantity}</span>
                )}
              </span>

              <span className="cart-total">${totalPrice.toFixed(2)}</span>
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
          <span>© 2022 All Rights Reserved.</span>
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
