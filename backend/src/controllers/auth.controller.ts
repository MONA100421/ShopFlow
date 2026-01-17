import { Request, Response } from "express";
import { UserModel } from "../models/User.model";

/**
 * ======================================================
 * POST /api/auth/login
 * Account-based login (by email)
 * ======================================================
 */
export async function login(req: Request, res: Response) {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // 🔑 Account-based: find or create user by email
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({ email });
    }

    // 🔥 核心：session 綁定 User._id（不是隨機 id）
    req.session.userId = user._id.toString();

    res.json({
      ok: true,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ login error:", err);
    res.status(500).json({
      error: "Login failed",
    });
  }
}

/**
 * ======================================================
 * POST /api/auth/logout
 * ======================================================
 */
export function logout(req: Request, res: Response) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
}

/**
 * ======================================================
 * GET /api/auth/me
 * ======================================================
 */
export async function me(req: Request, res: Response) {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.json(null);
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.json(null);
    }

    res.json({
      id: user._id.toString(),
      email: user.email,
    });
  } catch (err) {
    console.error("❌ me error:", err);
    res.status(500).json({
      error: "Failed to fetch current user",
    });
  }
}
