import { Router } from "express";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json({ products });
    } catch (err) {
        console.error("GET /products error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

// POST /api/products  (先要求登录；如果你要“只有 admin 才能加”，我下面也告诉你怎么做)
router.post("/", async (req, res) => {
    try {
        const payload = req.body || {};
        const created = await Product.create(payload);
        return res.status(201).json(created);
    } catch (err) {
        console.error("POST /products error:", err);
        return res.status(400).json({ message: "Create product failed" });
    }
});

export default router;
