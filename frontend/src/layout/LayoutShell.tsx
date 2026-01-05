import { useEffect, useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";

import CartDrawer from "../components/CartDrawer";
import { logout } from "../redux/slices/authSlice";
import { setSearch } from "../redux/slices/uiSlice";
import { removeFromCart, clearCart, setPromo } from "../redux/slices/cartSlice";
import { fetchProducts } from "../redux/slices/productSlice";

import searchIcon from "../assets/search.svg";
import facebookIcon from "../assets/facebook.svg";
import twitterIcon from "../assets/twitter.svg";
import youtubeIcon from "../assets/youtube.svg";
import UserCertifiedIcon from "../assets/carbon_user-certification.svg";

import "./LayoutShell.css";

// 迁移期宽松类型
type ProductLike = {
  _id?: string;
  id?: string;
  price?: number | string;
  [k: string]: any;
};

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="38"
      height="38"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="38"
      height="38"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
      <path d="M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  );
}

export default function LayoutShell() {
  const isSignedIn = Boolean(localStorage.getItem("token"));
  const dispatch = useDispatch<AppDispatch>();

  const token = useSelector((s: RootState) => (s as any).auth?.token || "");
  const search = useSelector((s: RootState) =>
    String((s as any).ui?.search || "")
  );

  const cartItems: Record<string, number> = useSelector(
    (s: RootState) => ((s as any).cart?.items as Record<string, number>) || {}
  );

  const products: ProductLike[] = useSelector(
    (s: RootState) => ((s as any).products?.items as ProductLike[]) || []
  );

  const [cartOpen, setCartOpen] = useState(false);

  const byId = useMemo(() => {
    return new Map<string, ProductLike>(
      products.map((p) => [String(p._id || p.id), p])
    );
  }, [products]);

  const cartCount = useMemo(() => {
    return Object.values(cartItems).reduce((sum, q) => sum + Number(q || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return Object.entries(cartItems).reduce((sum, [id, qty]) => {
      const p = byId.get(String(id));
      return sum + Number(p?.price || 0) * Number(qty || 0);
    }, 0);
  }, [cartItems, byId]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (!products.length) return;
    const valid = new Set(products.map((p) => String(p._id || p.id)));

    Object.keys(cartItems).forEach((id) => {
      if (!valid.has(String(id))) dispatch(removeFromCart(id));
    });
  }, [dispatch, products, cartItems]);

  const doLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(setPromo(""));
    try {
      localStorage.removeItem("sf_cart");
      localStorage.removeItem("sf_promo");
    } catch {
      // ignore
    }
  };

 return (
  <div className="shell">
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/products" className="brand">
          <span className="brand-main">Management</span>
          <span className="brand-sub">Chuwa</span>
        </Link>


        {/* ✅ Search bar */}
        <div className="search">
          <div className="search-box">
            <input
              className="search-input"
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              placeholder="Search products..."
            />
            <img className="search-icon" src={searchIcon} alt="search" />
          </div>
        </div>

        <div className="top-actions">
          {token ? (
            <button
              className="action-btn"
              type="button"
              onClick={doLogout}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {/* ✅ 登录态只显示一个图标：带星 */}
              {isSignedIn ? (
                <img
                  src={UserCertifiedIcon}
                  alt="certified"
                  className="action-ico"
                  style={{ width: 22, height: 22 }}
                />
              ) : (
                <UserIcon className="action-ico" />
              )}

              <span className="action-text">Sign Out</span>
            </button>
          ) : (
            <Link
              className="action-btn"
              to="/signin"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <UserIcon className="action-ico" />
              <span className="action-text">Sign In</span>
            </Link>
          )}

          <button
            className="action-btn"
            type="button"
            onClick={() => setCartOpen(true)}
          >
            <CartIcon className="action-ico" />
            <span className="action-text">
              ${Number(subtotal || 0).toFixed(2)}
            </span>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>

    <main className="content">
      <Outlet />
    </main>

    {/* ✅ Cart drawer */}
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-copy">©2026 Bingchen designed.</div>

        <div className="footer-social">
          <a
            className="social-btn"
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
          >
            <img className="social-icon" src={youtubeIcon} alt="YouTube" />
          </a>
          <a
            className="social-btn"
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
          >
            <img className="social-icon" src={twitterIcon} alt="Twitter" />
          </a>
          <a
            className="social-btn"
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
          >
            <img className="social-icon" src={facebookIcon} alt="Facebook" />
          </a>
        </div>

        <div className="footer-links">
          <a href="#">Contact us</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Help</a>
        </div>
      </div>
    </footer>
  </div>
);
}