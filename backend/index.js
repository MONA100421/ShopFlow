import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js"; // ✅ 加上这一行

dotenv.config();

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // ✅ 这里用 productRoutes（别写错变量名）

const PORT = process.env.PORT || 5001;

console.log("CWD =", process.cwd());
console.log("ENV check =", {
    MONGODB_URI: process.env.MONGODB_URI ? "✅ loaded" : "❌ missing",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ loaded" : "❌ missing",
    CLIENT_ORIGIN,
    PORT,
});
console.log("✅ productRoutes loaded?", typeof productRoutes); // ✅ 可删，但建议先留着排错

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(PORT, () => {
            console.log(`✅ API listening on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });
