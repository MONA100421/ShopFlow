import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =====================
   Types
===================== */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];

  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  applyDiscountCode: (code: string) => void;

  subtotal: number;
  tax: number;
  discount: number;
  total: number;

  discountCode: string | null;
  error: string | null;
}

/* =====================
   Context
===================== */

const CartContext = createContext<CartContextType | null>(null);

/* =====================
   Constants
===================== */

const TAX_RATE = 0.1; // 10% tax (符合 Figma)
const DISCOUNT_CODES: Record<string, number> = {
  "20DOLLAROFF": 20,
  "SAVE10": 10,
};

/* =====================
   Provider
===================== */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------
     Load from localStorage
  --------------------- */
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  /* ---------------------
     Persist to localStorage
  --------------------- */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  /* =====================
     Actions
  ===================== */

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setError(null);

    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(0);
    setDiscountCode(null);
  };

  const applyDiscountCode = (code: string) => {
    const normalized = code.trim().toUpperCase();

    if (!DISCOUNT_CODES[normalized]) {
      setError("Invalid discount code");
      setDiscount(0);
      setDiscountCode(null);
      return;
    }

    setDiscountCode(normalized);
    setDiscount(DISCOUNT_CODES[normalized]);
    setError(null);
  };

  /* =====================
     Calculations
  ===================== */

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [items]);

  const tax = useMemo(() => {
    return subtotal * TAX_RATE;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.max(subtotal + tax - discount, 0);
  }, [subtotal, tax, discount]);

  /* =====================
     Provider Value
  ===================== */

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyDiscountCode,
        subtotal,
        tax,
        discount,
        total,
        discountCode,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =====================
   Hook
===================== */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
