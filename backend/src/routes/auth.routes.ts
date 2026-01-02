import { Router } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * 把 register/login 的核心逻辑抽出来，
 * 这样可以同时挂多条路由（/register + /signup, /login + /signin）
 */

async function handleRegister(req, res) {
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
    const user = await User.create({
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

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    // 因为 passwordHash 默认 select:false，这里要显式取出来
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash"
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
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

/**
 * POST /api/auth/register
 * body: { email, password }
 */
router.post("/register", handleRegister);

/**
 * ✅ 兼容前端：POST /api/auth/signup
 * 等价于 /register
 */
router.post("/signup", handleRegister);

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", handleLogin);

/**
 * ✅ 兼容前端：POST /api/auth/signin
 * 等价于 /login
 */
router.post("/signin", handleLogin);

/**
 * ✅ 兼容前端的“忘记密码/更新密码”
 * POST /api/auth/update-password
 * body: { email, password }
 *
 * （注意：这不是生产级别的 reset flow，只是 demo/作业级别可用版本）
 */
router.post("/update-password", async (req, res) => {
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

    const user = await User.findOne({ email: normalizedEmail }).select(
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
});

/**
 * GET /api/auth/me  (需要登录)
 */
router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
