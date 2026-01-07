import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 🔹 Routes
import productRoutes from "./routes/product.routes.js";

// ==============================
// Env
// ==============================
dotenv.config();

// ==============================
// App
// ==============================
const app = express();

// ==============================
// Middleware
// ==============================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ==============================
// Health check
// ==============================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend server is running 🚀",
  });
});

// ==============================
// API Routes
// ==============================

// 🔹 Products API
app.use("/api/products", productRoutes);

// （之後會加）
// app.use("/api/auth", authRoutes);
// app.use("/api/cart", cartRoutes);

// ==============================
// 404 handler（一定放最後）
// ==============================
app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
  });
});

// ==============================
// Server
// ==============================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
