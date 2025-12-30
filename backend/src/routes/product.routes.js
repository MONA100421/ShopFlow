import { Router } from "express";
import Product from "../models/Product.js";
import { requireAuth, requireManager } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/products  列表
router.get("/", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json({ products });
    } catch (err) {
        console.error("GET /products error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

// ✅ GET /api/products/:id  详情（给 EditProduct 加载用）
router.get("/:id", async (req, res) => {
    try {
        const p = await Product.findById(req.params.id);
        if (!p) return res.status(404).json({ message: "Product not found" });
        return res.json(p);
    } catch (err) {
        console.error("GET /products/:id error:", err);
        return res.status(400).json({ message: "Invalid product id" });
    }
});

// ✅ POST /api/products  创建（只允许 manager）
router.post("/", requireAuth, requireManager, async (req, res) => {
    try {
        const payload = req.body || {};
        const created = await Product.create(payload);
        return res.status(201).json(created);
    } catch (err) {
        console.error("POST /products error:", err);
        return res.status(400).json({ message: "Create product failed" });
    }
});

// ✅ PUT /api/products/:id  更新（只允许 manager）
router.put("/:id", requireAuth, requireManager, async (req, res) => {
    try {
        const payload = req.body || {};
        const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
            new: true,
            runValidators: true,
        });

        if (!updated) return res.status(404).json({ message: "Product not found" });
        return res.json(updated);
    } catch (err) {
        console.error("PUT /products/:id error:", err);
        return res.status(400).json({ message: "Update product failed" });
    }
});

export default router;
