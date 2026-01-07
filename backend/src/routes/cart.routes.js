import express from "express";

const router = express.Router();

/* =========================================
   Mock product source（之後換 DB）
========================================= */
const mockProducts = [
  {
    id: "p2",
    title: "Mechanical Keyboard",
    description: "RGB mechanical keyboard",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    category: "general",
    stock: 5,
  },
  // 之後可加更多
];

/* =========================================
   In-memory cart store
========================================= */
/**
 * cartItems 結構：
 * [
 *   {
 *     product: { id, title, price, stock, ... },
 *     quantity: number
 *   }
 * ]
 */
let cartItems = [];

/* =========================================
   Helpers
========================================= */
const findProductById = (id) => mockProducts.find((p) => p.id === id);

/* =========================================
   GET /api/cart
   取得購物車內容
========================================= */
router.get("/", (req, res) => {
  res.json(cartItems);
});

/* =========================================
   POST /api/cart
   body: { product, quantity }
   ⚠️ 與前端 cartService.ts 完全對齊
========================================= */
router.post("/", (req, res) => {
  const { product, quantity } = req.body;

  // ✅ 嚴謹驗證（避免 400 spam）
  if (
    !product ||
    typeof product !== "object" ||
    !product.id ||
    typeof quantity !== "number" ||
    quantity <= 0
  ) {
    return res.status(400).json({
      error: "Invalid cart payload",
      body: req.body,
    });
  }

  const dbProduct = findProductById(product.id);

  if (!dbProduct) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  const existingItem = cartItems.find((item) => item.product.id === product.id);

  if (existingItem) {
    existingItem.quantity = Math.min(
      existingItem.quantity + quantity,
      dbProduct.stock
    );
  } else {
    cartItems.push({
      product: dbProduct,
      quantity: Math.min(quantity, dbProduct.stock),
    });
  }

  res.status(201).json(cartItems);
});

/* =========================================
   PUT /api/cart/:productId
   body: { delta: 1 | -1 }
========================================= */
router.put("/:productId", (req, res) => {
  const { productId } = req.params;
  const { delta } = req.body;

  if (delta !== 1 && delta !== -1) {
    return res.status(400).json({
      error: "Delta must be 1 or -1",
    });
  }

  const item = cartItems.find((i) => i.product.id === productId);

  if (!item) {
    return res.status(404).json({
      error: "Cart item not found",
    });
  }

  item.quantity += delta;

  // <= 0 → 移除
  if (item.quantity <= 0) {
    cartItems = cartItems.filter((i) => i.product.id !== productId);
  }
  // > stock → clamp
  else if (item.quantity > item.product.stock) {
    item.quantity = item.product.stock;
  }

  res.json(cartItems);
});

/* =========================================
   DELETE /api/cart/:productId
========================================= */
router.delete("/:productId", (req, res) => {
  const { productId } = req.params;

  cartItems = cartItems.filter((item) => item.product.id !== productId);

  res.json(cartItems);
});

/* =========================================
   DELETE /api/cart
   清空購物車
========================================= */
router.delete("/", (req, res) => {
  cartItems = [];
  res.json([]);
});

/* =========================================
   ⚠️ Demo only：給 Order 使用
   （之後接 DB 會整段移除）
========================================= */
router.__getCartItems = () => cartItems;

router.__clearCart = () => {
  cartItems = [];
};

export default router;
