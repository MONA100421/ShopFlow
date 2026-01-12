import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// ==============================
// Routes
// ==============================
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
// import authRoutes from "./routes/auth.routes"; // 🔒 之後再接

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

// CORS（允許 Vite 前端）
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// ==============================
// Health Check（部署 / debug 必備）
// ==============================
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Backend server is running 🚀",
    time: new Date().toISOString(),
  });
});

// ==============================
// API Routes
// ==============================

// 🔹 Products
app.use("/api/products", productRoutes);

// 🔹 Cart
app.use("/api/cart", cartRoutes);

// 🔹 Orders（Checkout → Order）
app.use("/api/orders", orderRoutes);

// 🔹 Auth（之後接 JWT / Session）
// app.use("/api/auth", authRoutes);

// ==============================
// 404 Handler（一定放最後）
// ==============================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});

// ==============================
// Server
// ==============================
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
