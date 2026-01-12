import { Router } from "express";
/* ======================================================
   Router
====================================================== */
const router = Router();
/* ======================================================
   Mock Data（暫存於記憶體）
====================================================== */
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
router.get("/", (_req, res) => {
    res.json(mockProducts);
});
/* ======================================================
   GET /api/products/:id
   👉 取得單一商品
====================================================== */
router.get("/:id", (req, res) => {
    const product = mockProducts.find((item) => item.id === req.params.id);
    if (!product) {
        return res.status(404).json({
            error: "Product not found",
        });
    }
    res.json(product);
});
/* ======================================================
   POST /api/products
   👉 新增商品
====================================================== */
router.post("/", (req, res) => {
    const { title, price, stock, image, description } = req.body;
    if (!title ||
        typeof price !== "number" ||
        typeof stock !== "number") {
        return res.status(400).json({
            error: "Invalid product data",
        });
    }
    const newProduct = {
        id: `p${Date.now()}`,
        title,
        price,
        stock,
        image,
        description,
        createdAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    res.status(201).json(newProduct);
});
/* ======================================================
   PUT /api/products/:id
   👉 更新商品
====================================================== */
router.put("/:id", (req, res) => {
    const index = mockProducts.findIndex((item) => item.id === req.params.id);
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
   👉 刪除商品（記憶體）
====================================================== */
router.delete("/:id", (req, res) => {
    const index = mockProducts.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({
            error: "Product not found",
        });
    }
    const [deletedProduct] = mockProducts.splice(index, 1);
    res.json(deletedProduct);
});
export default router;
