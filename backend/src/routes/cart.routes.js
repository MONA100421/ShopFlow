import express from "express";

const router = express.Router();

/**
 * =========================================
 * In-memory cart store（暫存）
 * ⚠️ 之後接 MongoDB 只要整段換掉
 * =========================================
 */
let cartItems = [];
/**
 * cartItems 結構：
 * [
 *   {
 *     product: { id, title, price, image, stock, ... },
 *     quantity: number
 *   }
 * ]
 */

/**
 * =========================================
 * GET /api/cart
 * 取得購物車內容
 * =========================================
 */
router.get("/", (req, res) => {
  res.json(cartItems);
});

/**
 * =========================================
 * POST /api/cart
 * 新增商品到購物車
 * body: { product, quantity }
 * =========================================
 */
router.post("/", (req, res) => {
  const { product, quantity } = req.body;

  if (!product || !product.id) {
    return res.status(400).json({
      error: "Invalid product data",
    });
  }

  const existingItem = cartItems.find((item) => item.product.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity ?? 1;
  } else {
    cartItems.push({
      product,
      quantity: quantity ?? 1,
    });
  }

  res.status(201).json(cartItems);
});

/**
 * =========================================
 * PUT /api/cart/:productId
 * 調整商品數量（+1 / -1）
 * body: { delta: 1 | -1 }
 * =========================================
 */
router.put("/:productId", (req, res) => {
  const { productId } = req.params;
  const { delta } = req.body;

  const item = cartItems.find((i) => i.product.id === productId);

  if (!item) {
    return res.status(404).json({
      error: "Cart item not found",
    });
  }

  item.quantity += delta;

  // 數量 <= 0 → 移除
  if (item.quantity <= 0) {
    cartItems = cartItems.filter((i) => i.product.id !== productId);
  }

  res.json(cartItems);
});

/**
 * =========================================
 * DELETE /api/cart/:productId
 * 移除單一商品
 * =========================================
 */
router.delete("/:productId", (req, res) => {
  const { productId } = req.params;

  cartItems = cartItems.filter((item) => item.product.id !== productId);

  res.json(cartItems);
});

/**
 * =========================================
 * DELETE /api/cart
 * 清空購物車
 * =========================================
 */
router.delete("/", (req, res) => {
  cartItems = [];
  res.json([]);
});

export default router;
