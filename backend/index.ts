// backend/index.ts
import expressImport from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

// ✅ 关键：兼容 ESM / CJS 的 express 导入（避免 express is not a function）
const express = (expressImport as any).default ?? (expressImport as any);

import User from "./src/models/User.js";
import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";

// =========================
// 环境变量
// =========================
dotenv.config();

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const PORT = Number(process.env.PORT || 5001);
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Missing env: MONGODB_URI");
  process.exit(1);
}

// =========================
// Middlewares
// =========================
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// =========================
// Routes
// =========================
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// =========================
// Debug info
// =========================
console.log("CWD =", process.cwd());
console.log("ENV check =", {
  MONGODB_URI: MONGODB_URI ? "✅ loaded" : "❌ missing",
  JWT_SECRET: process.env.JWT_SECRET ? "✅ loaded" : "❌ missing",
  CLIENT_ORIGIN,
  PORT,
});

// =========================
// DB + Server
// =========================
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // ---- admin seed（作业 / demo 用）----
    const ADMIN_EMAIL = (
      process.env.ADMIN_EMAIL || "admin@chuwa.com"
    ).toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";

    try {
      const existing: any = await User.findOne({ email: ADMIN_EMAIL }).select(
        "+passwordHash"
      );

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
    } catch (e: any) {
      console.warn("⚠️ Admin seed skipped:", e?.message || e);
    }

    // ---- start server ----
    const server = app.listen(PORT, () => {
      console.log(`✅ API listening on http://localhost:${PORT}`);
    });

    // ---- graceful shutdown ----
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down...`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
        } catch {}
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
