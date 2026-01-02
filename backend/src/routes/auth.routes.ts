// backend/src/routes/auth.routes.ts
import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

type AuthBody = { email?: string; password?: string };

async function handleRegister(req: Request<{}, {}, AuthBody>, res: Response) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 chars" });
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user: any = await User.create({
      email: normalizedEmail,
      passwordHash,
      role: "regular",
    });

    return res.status(201).json({
      message: "Registered",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function handleLogin(req: Request<{}, {}, AuthBody>, res: Response) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const user: any = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash"
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ message: "Server misconfigured: JWT_SECRET missing" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      secret, // ✅ TS 在上面的 if 之后知道它是 string
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/register
router.post("/register", handleRegister);

// ✅ 兼容前端：POST /api/auth/signup
router.post("/signup", handleRegister);

// POST /api/auth/login
router.post("/login", handleLogin);

// ✅ 兼容前端：POST /api/auth/signin
router.post("/signin", handleLogin);

// ✅ demo版更新密码
router.post(
  "/update-password",
  async (req: Request<{}, {}, AuthBody>, res: Response) => {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 chars" });
      }

      const normalizedEmail = email.toLowerCase();

      const user: any = await User.findOne({ email: normalizedEmail }).select(
        "+passwordHash"
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();

      return res.json({ message: "Password updated" });
    } catch (err) {
      console.error("update-password error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// GET /api/auth/me
router.get("/me", requireAuth as any, async (req: Request, res: Response) => {
  // requireAuth 往 req.user 挂东西，TS 默认不知道；不动别的文件就先忽略类型
  // @ts-ignore
  return res.json({ user: req.user });
});

export default router;
