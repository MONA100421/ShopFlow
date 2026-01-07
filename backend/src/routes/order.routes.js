import express from "express";

const router = express.Router();

/**
 * =========================================
 * In-memory Order Store（暫存）
 * ⚠️ 未來換成 MongoDB / PostgreSQL
 * =========================================
 */
let orders = [];

/**
 * ⚠️ 注意：
 * 這裡「暫時」直接 require cart 資料
 * 實務上應該由 cart service / DB 取得
 */
import cartRouter from "./cart.routes.js";

/**
 * =========================================
 * POST /api/orders
 * 建立訂單（Checkout 最終步）
 * =========================================
 */
router.post("/", (req, res) => {
  /**
   * 真實系統會從：
   * - req.user.id
   * - cart DB
   * - payment result
   * 取得資料
   */

  // ⚠️ demo：直接從記憶體 cart 拿資料
  const cartItems = cartRouter.__getCartItems?.() ?? [];

  if (!cartItems.length) {
    return res.status(400).json({
      error: "Cart is empty",
    });
  }

  /* ================= 計算價格 ================= */

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const tax = subtotal * 0.1;
  const discount = 0; // 預留優惠邏輯
  const total = subtotal + tax - discount;

  /* ================= 建立 Order ================= */

  const order = {
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

  cartRouter.__clearCart?.();

  res.status(201).json(order);
});

/**
 * =========================================
 * GET /api/orders
 * 取得所有訂單（Admin / Demo）
 * =========================================
 */
router.get("/", (req, res) => {
  res.json(orders);
});

/**
 * =========================================
 * GET /api/orders/:orderId
 * 取得單一訂單
 * =========================================
 */
router.get("/:orderId", (req, res) => {
  const { orderId } = req.params;

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return res.status(404).json({
      error: "Order not found",
    });
  }

  res.json(order);
});

export default router;
