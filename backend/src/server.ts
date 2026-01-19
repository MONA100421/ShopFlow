import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";

// Routes
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();

// Basic Middleware 
// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow cookie
  })
);

// JSON parser
app.use(express.json());

// Session Middleware
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // local dev
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI!,
      collectionName: "sessions",
    }),
  })
);

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    session: true,
    time: new Date().toISOString(),
  });
});

// API Routes
// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// 404 for API routes
app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = Number(process.env.PORT) || 4000;
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
