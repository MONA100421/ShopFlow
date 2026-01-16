import { Request, Response, NextFunction } from "express";

/**
 * TEMP auth middleware (DEV ONLY)
 * 先假裝使用者已登入
 */
export const auth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.user = {
    id: "000000000000000000000001", // 假 userId（ObjectId 格式）
    email: "dev@test.com",
  };

  next();
};
