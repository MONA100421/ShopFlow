import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

const StoreContext = createContext(null);
const LS_SEARCH = "sf_search";
const LS_CART = "sf_cart";
const LS_PROMO = "sf_promo";



function loadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function StoreProvider({ children }) {
    // ✅ 商品唯一来源：Redux（Mongo）
    const products = useSelector((s) => s.products.items || []);

    // cart: { [productId]: qty }
    const [cart, setCart] = useState(() => loadJson(LS_CART, {}));
    const [promo, setPromo] = useState(() => localStorage.getItem(LS_PROMO) || "");
    const [search, setSearch] = useState(() => localStorage.getItem(LS_SEARCH) || "");
    useEffect(() => {
        localStorage.setItem(LS_CART, JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem(LS_PROMO, promo);
    }, [promo]);

    useEffect(() => {
        localStorage.setItem(LS_SEARCH, search);
    }, [search]);

    // ------- cart actions -------
    const addToCart = (id, delta = 1) => {
        setCart(prev => {
            const next = { ...prev };
            const cur = Number(next[id] || 0);
            const val = Math.max(0, cur + delta);
            if (val === 0) delete next[id];
            else next[id] = val;
            return next;
        });
    };

    const setQty = (id, qty) => {
        setCart(prev => {
            const next = { ...prev };
            const val = Math.max(0, Number(qty || 0));
            if (val === 0) delete next[id];
            else next[id] = val;
            return next;
        });
    };

    function removeFromCart(id) {
        setCart((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }

    function clearCart() {
        setCart({});
    }

    // ------- derived totals (join by _id) -------
    const cartItems = useMemo(() => {
        // Map: productId -> product
        const byId = new Map(products.map((p) => [String(p._id || p.id), p]));

        return Object.entries(cart)
            .map(([id, qty]) => {
                const p = byId.get(String(id));
                if (!p) return null; // products 还没加载完时先跳过
                const pid = String(p._id || p.id);

                return {
                    ...p,
                    id: pid, // ✅ 给 CartDrawer/Cart 页统一用 it.id
                    qty,
                    lineTotal: Number(p.price || 0) * qty,
                    image: p.image || "https://via.placeholder.com/120?text=No+Image",
                };
            })
            .filter(Boolean);
    }, [cart, products]);

    const subtotal = useMemo(
        () => cartItems.reduce((s, it) => s + it.lineTotal, 0),
        [cartItems]
    );

    const taxRate = 0.1;

    const tax = useMemo(() => +(subtotal * taxRate).toFixed(2), [subtotal]);

    const discount = useMemo(() => {
        const code = promo.trim().toUpperCase();
        if (!code) return 0;

        // ✅ SAVE10：10% off subtotal
        if (code === "SAVE10") return Math.min(10, subtotal);

        // ✅ SAVE20：$20 off (cap at subtotal)
        if (code === "SAVE20") return Math.min(20, subtotal);

        // ✅ invalid code => no discount
        return 0;
    }, [promo, subtotal]);

    const total = useMemo(() => +(subtotal + tax - discount).toFixed(2), [subtotal, tax, discount]);


    const cartCount = useMemo(
        () => cartItems.reduce((c, it) => c + it.qty, 0),
        [cartItems]
    );

    const value = {
        cart,
        cartItems,
        addToCart,
        setQty,
        removeFromCart,
        clearCart,

        promo,
        setPromo,

        search,
        setSearch,

        subtotal,
        tax,
        discount,
        total,
        cartCount,
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStore must be used within StoreProvider");
    return ctx;
}
