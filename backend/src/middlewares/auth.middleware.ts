// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.session as any)?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    // ✅ Demo 專案：只補最小必要資訊
    req.user = {
      id: userId,
    };

    next();
  } catch (err) {
    console.error("❌ authMiddleware error:", err);
    res.status(500).json({
      error: "Authentication middleware failed",
    });
  }
};
