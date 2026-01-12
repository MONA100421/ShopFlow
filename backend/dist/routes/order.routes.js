import { Router } from "express";
import cartRouter from "./cart.routes.js";
/* ======================================================
   Router
====================================================== */
const router = Router();
/* ======================================================
   In-memory Order Store（暫存）
   ⚠️ 未來換成 MongoDB / PostgreSQL
====================================================== */
const orders = [];
/* ======================================================
   POST /api/orders
   建立訂單（Checkout 最終步）
====================================================== */
router.post("/", (_req, res) => {
    /**
     * 真實系統會從：
     * - req.user.id
     * - cart DB
     * - payment result
     * 取得資料
     */
    const cartHelpers = cartRouter;
    // ⚠️ demo：直接從記憶體 cart 拿資料
    const cartItems = cartHelpers.__getCartItems?.() ?? [];
    if (!cartItems.length) {
        return res.status(400).json({
            error: "Cart is empty",
        });
    }
    /* ================= 計算價格 ================= */
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = Number((subtotal * 0.1).toFixed(2));
    const discount = 0; // 預留優惠邏輯
    const total = Number((subtotal + tax - discount).toFixed(2));
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
    cartHelpers.__clearCart?.();
    res.status(201).json(order);
});
/* ======================================================
   GET /api/orders
   取得所有訂單（Admin / Demo）
====================================================== */
router.get("/", (_req, res) => {
    res.json(orders);
});
/* ======================================================
   GET /api/orders/:orderId
   取得單一訂單
====================================================== */
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
