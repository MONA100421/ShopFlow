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

export default function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [value, setValue] = useState(searchParams.get("q") || "");
  const [isComposing, setIsComposing] = useState(false);

  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const items = useSelector((state: RootState) => state.cart.items);
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const commitSearch = (v: string) => {
    navigate(v ? `/?q=${encodeURIComponent(v)}` : "/");
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
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
                  commitSearch(v); // ✅ 組字完成才搜尋
                }}
                onChange={(e) => {
                  const v = e.target.value;
                  setValue(v);

                  if (isComposing) return; // ❌ 組字中不做事
                  commitSearch(v); // ✅ 英文即時搜尋
                }}
              />
              <img src={searchIcon} alt="Search" className="search-icon" />
            </div>
          </div>

          {/* ===== Actions ===== */}
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

      <main className="site-main">
        <div className="container">
          <Outlet context={{ setCartOpen }} />
        </div>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>© 2022 All Rights Reserved.</span>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
