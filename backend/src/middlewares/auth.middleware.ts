// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.session as any)?.userId;

    // 🔥 對 cart 的 GET，允許「未 attach 完」的情況
    if (!userId) {
      // ⚠️ 僅允許 GET /api/cart
      if (
        req.method === "GET" &&
        req.originalUrl === "/api/cart"
      ) {
        // 標記為 guest-like，但不 throw
        (req as any).user = null;
        return next();
      }

      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    req.user = { id: userId };
    next();
  } catch (err) {
    console.error("❌ authMiddleware error:", err);
    res.status(500).json({
      error: "Authentication middleware failed",
    });
  }
};
