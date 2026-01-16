// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

/* ================= Routes ================= */
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
// import authRoutes from "./routes/auth.routes";

const app = express();

/* ================= Middleware ================= */

// CORS（允許 Vite 前端）
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

/* ================= Health Check ================= */

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend server is running 🚀",
    time: new Date().toISOString(),
  });
});

/* ================= API Routes ================= */

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
// app.use("/api/auth", authRoutes);

/* ================= 404 Handler ================= */

app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});

/* ================= MongoDB ================= */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = Number(process.env.PORT) || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
