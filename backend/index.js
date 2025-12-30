import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";                 // ✅【新增】
import User from "./src/models/User.js";        // ✅【新增】

import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";

dotenv.config();

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5001;

console.log("CWD =", process.cwd());
console.log("ENV check =", {
    MONGODB_URI: process.env.MONGODB_URI ? "✅ loaded" : "❌ missing",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ loaded" : "❌ missing",
    CLIENT_ORIGIN,
    PORT,
});
console.log("✅ productRoutes loaded?", typeof productRoutes);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("✅ MongoDB connected");

        // ======================================================
        // ✅【新增】自动 seed / 修复 admin（manager）账号
        // ======================================================
        const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@chuwa.com").toLowerCase();
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";

        try {
            const existing = await User.findOne({ email: ADMIN_EMAIL }).select("+passwordHash");

            if (!existing) {
                const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
                await User.create({
                    email: ADMIN_EMAIL,
                    passwordHash,
                    role: "admin",
                });
                console.log(`✅ Seeded admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
            } else if (existing.role !== "admin") {
                existing.role = "admin";
                await existing.save();
                console.log(`✅ Promoted to admin: ${ADMIN_EMAIL}`);
            } else {
                console.log(`✅ Admin exists: ${ADMIN_EMAIL}`);
            }
        } catch (e) {
            console.warn("⚠️ Admin seed skipped:", e?.message || e);
        }

        app.listen(PORT, () => {
            console.log(`✅ API listening on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });
