// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.model";

import crypto from "crypto";
import { sendTestEmail } from "../services/sendgrid";

/**
 * ======================================================
 * POST /api/auth/register
 * ======================================================
 */
export async function register(req: Request, res: Response) {

  console.log("🧪 REGISTER req.body =", req.body);
  
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

/**
 * ======================================================
 * forget/reset psw
 * ======================================================
 */
export async function forgotPassword(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await UserModel.findOne({ email });

    // ✅ 安全策略：不暴露用户是否存在
    if (!user) {
      return res.json({
        ok: true,
        message:
          "If the email exists, a reset link has been sent.",
      });
    }

    // 1️⃣ 生成给用户用的原始 token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // 2️⃣ 对 token 做 hash（存数据库）
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 3️⃣ 存 hash + 过期时间（15 分钟）
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    // 4️⃣ 构造前端重置链接（⚠️ 用原始 token）
    const resetUrl = `${process.env.FRONTEND_PUBLIC_URL}/reset-password?token=${resetToken}`;

    // 5️⃣ 发送邮件
    await sendTestEmail(user.email, {
      subject: "Reset your ShopFlow password",
      html: `
        <p>Hi,</p>
        <p>We received a request to reset your ShopFlow password.</p>
        <p>
          <a href="${resetUrl}">
            Click here to reset your password
          </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      `,
    });

    return res.json({
      ok: true,
      message:
        "If the email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("❌ forgotPassword error:", err);
    return res.status(500).json({
      error: "Failed to process forgot password",
    });
  }
}

export async function resetPassword(
  req: Request,
  res: Response
) {
  try {
    const { token, password } = req.body as {
      token?: string;
      password?: string;
    };

    if (!token || !password) {
      return res.status(400).json({
        error: "Token and password are required",
      });
    }

    // 1️⃣ 对前端传来的 token 做 hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2️⃣ 查找用户（token 匹配 + 未过期）
    const user = await UserModel.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
      });
    }

    // 3️⃣ 更新密码
    user.passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ 清除 reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({
      ok: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("❌ resetPassword error:", err);
    return res.status(500).json({
      error: "Failed to reset password",
    });
  }
}
