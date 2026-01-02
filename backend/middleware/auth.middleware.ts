import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

type AuthedUser = {
  id?: string;
  email?: string;
  role?: string;
  [k: string]: unknown;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing env: JWT_SECRET");
  return secret;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    const payload: AuthedUser =
      typeof decoded === "string" ? { id: decoded } : (decoded as JwtPayload);

    req.user = payload; // ✅ 现在不会再报 req.user 不存在
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireManager(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const role = String(req.user?.role || "").toLowerCase();
  if (role !== "admin" && role !== "manager") {
    return res.status(403).json({ message: "Manager only" });
  }
  return next();
}
