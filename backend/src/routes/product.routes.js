import express from "express";

const router = express.Router();

/**
 * ✅ 暫時用的假資料（之後會換成 MongoDB）
 * ⚠️ 結構已對齊前端 Product type
 */
const mockProducts = [
  {
    id: "p1",
    title: "Wireless Headphones",
    price: 129.99,
    stock: 10,
    image: "https://images.unsplash.com/photo-1518441902117-f63bcbe3d8f8",
    description: "High quality wireless headphones",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    title: "Mechanical Keyboard",
    price: 89.99,
    stock: 5,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    description: "RGB mechanical keyboard",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    title: "Gaming Mouse",
    price: 49.99,
    stock: 0,
    image: "https://images.unsplash.com/photo-1584270354949-1b3b3c48e5b3",
    description: "High precision gaming mouse",
    createdAt: new Date().toISOString(),
  },
];

/* ======================================================
   GET /api/products
   👉 取得所有商品
====================================================== */
router.get("/", (req, res) => {
  res.json(mockProducts);
});

/* ======================================================
   GET /api/products/:id
   👉 取得單一商品
====================================================== */
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const product = mockProducts.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  res.json(product);
});

/* ======================================================
   POST /api/products
   👉 新增商品（暫時只回傳，不存 DB）
====================================================== */
router.post("/", (req, res) => {
  const newProduct = {
    id: `p${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  mockProducts.push(newProduct);

  res.status(201).json(newProduct);
});

/* ======================================================
   PUT /api/products/:id
   👉 更新商品（暫時只改記憶體）
====================================================== */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const index = mockProducts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  mockProducts[index] = {
    ...mockProducts[index],
    ...req.body,
  };

  res.json(mockProducts[index]);
});

/* ======================================================
   DELETE /api/products/:id
   👉 刪除商品
====================================================== */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = mockProducts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  const deleted = mockProducts.splice(index, 1);

  res.json(deleted[0]);
});

export default router;
