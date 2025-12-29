import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import CartDrawer from "../components/CartDrawer";
import "./LayoutShell.css";

export default function LayoutShell() {
    // ✅ 先让页面跑起来：从 Redux 读（如果还没 cart slice，就给默认值）
    const cartCount = useSelector((state) => state?.cart?.items?.length ?? 0);
    const subtotal = useSelector((state) => state?.cart?.subtotal ?? 0);

    const [cartOpen, setCartOpen] = useState(false);

    return (
        <div className="shell">
            <header className="topbar">
                <div className="topbar-inner">
                    <div className="brand">
                        <span className="brand-main">Management</span>
                        <span className="brand-sub">Chuwa</span>
                    </div>

                    <div className="search">
                        <input className="search-input" placeholder="Search" />
                        <span className="search-icon">🔍</span>
                    </div>

                    <div className="top-actions">
                        {/* Sign In → /signin */}
                        <Link className="action" to="/signin">
                            <span className="icon">👤</span>
                            <span>Sign In</span>
                        </Link>

                        {/* Cart Drawer */}
                        <button
                            className="action"
                            type="button"
                            onClick={() => setCartOpen(true)}
                        >
                            <span className="icon">🛒</span>
                            <span>${Number(subtotal || 0).toFixed(2)}</span>
                            {cartCount > 0 && <span className="badge">{cartCount}</span>}
                        </button>
                    </div>
                </div>
            </header>

            <main className="content">
                <Outlet />
            </main>

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

            <footer className="footer">
                <div className="footer-inner">
                    <div>©2022 All Rights Reserved.</div>
                    <div className="footer-icons">
                        <span>▶️</span>
                        <span>🐦</span>
                        <span>f</span>
                    </div>
                    <div className="footer-links">
                        <a href="#">Contact us</a>
                        <a href="#">Privacy Policies</a>
                        <a href="#">Help</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
