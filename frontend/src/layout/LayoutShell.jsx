import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";


import CartDrawer from "../components/CartDrawer";
import { logout } from "../redux/slices/authSlice";
import { setSearch } from "../redux/slices/uiSlice";
import { removeFromCart, clearCart, setPromo } from "../redux/slices/cartSlice";
import { fetchProducts } from "../redux/slices/productSlice";

import "./LayoutShell.css";

export default function LayoutShell() {
    const dispatch = useDispatch();

    // ===== Redux 状态 =====
    const token = useSelector((s) => s.auth.token);
    const search = useSelector((s) => s.ui.search);

    // cart 仍然来自 Redux（你现在已经在 store 里有 cart slice）
    const cartItems = useSelector((s) => s.cart.items || {});
    const products = useSelector((s) => s.products.items || []);

    // ===== UI 本地状态 =====
    const [cartOpen, setCartOpen] = useState(false);

    // ===== 计算 cartCount / subtotal（保持和你之前一致）=====
    const byId = new Map(products.map((p) => [String(p._id || p.id), p]));

    const cartCount = Object.values(cartItems).reduce(
        (sum, q) => sum + Number(q || 0),
        0
    );

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);
    
    useEffect(() => {
        if (!products.length) return;

        const valid = new Set(products.map((p) => String(p._id || p.id)));

        Object.keys(cartItems).forEach((id) => {
            if (!valid.has(String(id))) {
                dispatch(removeFromCart(id));
            }
        });
    }, [dispatch, products, cartItems]);

    const subtotal = Object.entries(cartItems).reduce((sum, [id, qty]) => {
        const p = byId.get(String(id));
        return sum + Number(p?.price || 0) * Number(qty || 0);
    }, 0);

    return (
        <div className="shell">
            <header className="topbar">
                <div className="topbar-inner">
                    <div className="brand">
                        <span className="brand-main">Management</span>
                        <span className="brand-sub">Chuwa</span>
                    </div>

                    {/* ===== Search（Redux） ===== */}
                    <div className="search">
                        <input
                            className="search-input"
                            placeholder="Search products"
                            value={search}
                            onChange={(e) => dispatch(setSearch(e.target.value))}
                        />
                        <span className="search-icon">🔍</span>
                    </div>

                    {/* ===== Top Actions ===== */}
                    <div className="top-actions">
                        {/* Auth button */}
                        {token ? (
                            <button
                                className="action"
                                type="button"
                                onClick={() => {
                                    dispatch(logout());
                                    dispatch(clearCart());
                                    dispatch(setPromo(""));
                                    try {
                                        localStorage.removeItem("sf_cart");
                                        localStorage.removeItem("sf_promo");
                                    } catch { }
                                }}

                            >
                                <span className="icon">👤</span>
                                <span>Sign Out</span>
                            </button>
                        ) : (
                            <Link className="action" to="/signin">
                                <span className="icon">👤</span>
                                <span>Sign In</span>
                            </Link>
                        )}

                        {/* Cart Drawer */}
                        <button
                            className="action"
                            type="button"
                            onClick={() => setCartOpen(true)}
                        >
                            <span className="icon">🛒</span>
                            <span>${Number(subtotal || 0).toFixed(2)}</span>
                            {cartCount > 0 && (
                                <span className="badge">{cartCount}</span>
                            )}
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
