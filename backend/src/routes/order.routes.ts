import { Router, Request, Response } from "express";
import cartRouter from "./cart.routes";

/* ======================================================
   Types（之後 DB / Payment 都可直接沿用）
====================================================== */

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "created" | "paid" | "shipped" | "completed";
  createdAt: string;
}

/**
 * ⚠️ CartRouter 擴充型別
 * （因為 __getCartItems / __clearCart 是 demo-only）
 */
interface CartRouterWithHelpers {
  __getCartItems?: () => {
    product: {
      id: string;
      title: string;
      price: number;
    };
    quantity: number;
  }[];
  __clearCart?: () => void;
}

/* ======================================================
   Router
====================================================== */

const router = Router();

/* ======================================================
   In-memory Order Store（暫存）
   ⚠️ 未來換成 MongoDB / PostgreSQL
====================================================== */

const orders: Order[] = [];

/* ======================================================
   POST /api/orders
   建立訂單（Checkout 最終步）
====================================================== */
router.post("/", (_req: Request, res: Response) => {
  /**
   * 真實系統會從：
   * - req.user.id
   * - cart DB
   * - payment result
   * 取得資料
   */

  const cartHelpers =
    cartRouter as unknown as CartRouterWithHelpers;

  // ⚠️ demo：直接從記憶體 cart 拿資料
  const cartItems = cartHelpers.__getCartItems?.() ?? [];

  if (!cartItems.length) {
    return res.status(400).json({
      error: "Cart is empty",
    });
  }

  /* ================= 計算價格 ================= */

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  const tax = Number((subtotal * 0.1).toFixed(2));
  const discount = 0; // 預留優惠邏輯
  const total = Number(
    (subtotal + tax - discount).toFixed(2)
  );

  /* ================= 建立 Order ================= */

  const order: Order = {
    id: `ORD-${Date.now()}`,
    items: cartItems.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
    })),
    subtotal,
    tax,
    discount,
    total,
    status: "created",
    createdAt: new Date().toISOString(),
  };

  orders.push(order);

  /* ================= 清空購物車 ================= */

  cartHelpers.__clearCart?.();

  res.status(201).json(order);
});

/* ======================================================
   GET /api/orders
   取得所有訂單（Admin / Demo）
====================================================== */
router.get("/", (_req: Request, res: Response) => {
  res.json(orders);
});

/* ======================================================
   GET /api/orders/:orderId
   取得單一訂單
====================================================== */
router.get(
  "/:orderId",
  (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = orders.find(
      (o) => o.id === orderId
    );

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.json(order);
  }
);

export default router;
