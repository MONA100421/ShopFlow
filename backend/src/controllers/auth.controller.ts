// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.model";

/**
 * ======================================================
 * POST /api/auth/register
 * ======================================================
 */
export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 👉 Demo 規則：email 包含 admin → admin
    const role = email.toLowerCase().includes("admin")
      ? "admin"
      : "user";

    const user = await UserModel.create({
      email,
      passwordHash,
      role,
    });

    req.session.userId = user._id.toString();

    res.json({
      ok: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ register error:", err);
    res.status(500).json({
      error: "Register failed",
    });
  }
}

/**
 * ======================================================
 * POST /api/auth/login
 * ======================================================
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "User not found. Please sign up first.",
      });
    }

    const match = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!match) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    req.session.userId = user._id.toString();

    res.json({
      ok: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
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
      role: user.role,
    });
  } catch (err) {
    console.error("❌ me error:", err);
    res.status(500).json({
      error: "Failed to fetch current user",
    });
  }
}
