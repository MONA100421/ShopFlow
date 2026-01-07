import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ==============================
// Routes
// ==============================
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
// import authRoutes from "./routes/auth.routes.js"; // 之後再開

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

// CORS（允許前端 Vite）
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// ==============================
// Health Check
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

// 🔹 Products
app.use("/api/products", productRoutes);

// 🔹 Cart
app.use("/api/cart", cartRoutes);

// 🔹 Auth（之後接）
// app.use("/api/auth", authRoutes);

// ==============================
// 404 Handler（一定放最後）
// ==============================
app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});

// ==============================
// Server
// ==============================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
