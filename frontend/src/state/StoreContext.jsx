import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);

const LS_PRODUCTS = "sf_products";
const LS_CART = "sf_cart";
const LS_PROMO = "sf_promo";

function seedProducts() {
    return [];
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const existing = loadJson(LS_PRODUCTS, null);
    if (existing && Array.isArray(existing) && existing.length) return existing;
    const seeded = seedProducts();
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(seeded));
    return seeded;
  });

  // cart: { [productId]: qty }
  const [cart, setCart] = useState(() => loadJson(LS_CART, {}));
  const [promo, setPromo] = useState(() => localStorage.getItem(LS_PROMO) || "");

  useEffect(() => {
    localStorage.setItem(LS_CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LS_PROMO, promo);
  }, [promo]);

  // ------- product actions -------
  function addProduct(p) {
    setProducts((prev) => [{ ...p }, ...prev]);
  }

  function updateProduct(id, patch) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  // ------- cart actions -------
  function addToCart(id, qty = 1) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + qty }));
  }

  function setQty(id, qty) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

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

  // ------- derived totals -------
  const cartItems = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return Object.entries(cart)
      .map(([id, qty]) => {
        const p = byId.get(id);
        if (!p) return null;
        return { ...p, qty, lineTotal: p.price * qty };
      })
      .filter(Boolean);
  }, [cart, products]);

  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + it.lineTotal, 0),
    [cartItems]
  );

  const taxRate = 0.1; // 10%
  const tax = useMemo(() => +(subtotal * taxRate).toFixed(2), [subtotal]);

  const discount = useMemo(() => {
    // demo: code SAVE20 => $20 off, SAVE10 => 10% off
    const code = promo.trim().toUpperCase();
    if (!code) return 0;
    if (code === "SAVE20") return Math.min(20, subtotal);
    if (code === "SAVE10") return +(subtotal * 0.1).toFixed(2);
    return 0;
  }, [promo, subtotal]);

  const total = useMemo(
    () => +(subtotal + tax - discount).toFixed(2),
    [subtotal, tax, discount]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((c, it) => c + it.qty, 0),
    [cartItems]
  );

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,

    cart,
    cartItems,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,

    promo,
    setPromo,

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
