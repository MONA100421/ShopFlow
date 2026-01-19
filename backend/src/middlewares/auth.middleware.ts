import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.session as any)?.userId;

    if (!userId) {
      if (
        req.method === "GET" &&
        req.originalUrl === "/api/cart"
      ) {
        // Attach a null user to indicate unauthenticated
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
    console.error("authMiddleware error:", err);
    res.status(500).json({
      error: "Authentication middleware failed",
    });
  }
};
