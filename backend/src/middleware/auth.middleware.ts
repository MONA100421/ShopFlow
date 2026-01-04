

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";


type AuthedUser = JwtPayload & {
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

function extractToken(authHeader: string): string {
  let token = String(authHeader || "");

  // 1) 去掉 Bearer 前缀（不区分大小写）
  token = token.replace(/^Bearer\s+/i, "");

  // 2) 去掉首尾空格
  token = token.trim();

  // 3) 去掉首尾引号：Bearer "xxx" / 'xxx'
  token = token.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(String(req.headers.authorization || ""));

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const payload: AuthedUser =
      typeof decoded === "string"
        ? ({ id: decoded } as AuthedUser)
        : (decoded as AuthedUser);

    // TS 兜底：req.user 不是 express 默认字段
    (req as any).user = payload;
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
  const role = String((req as any).user?.role || "").toLowerCase();
  if (role !== "admin" && role !== "manager") {
    return res.status(403).json({ message: "Manager only" });
  }
  return next();
}
