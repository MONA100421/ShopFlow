import {
  register,
  login,
  logout,
} from "../controllers/auth.controller";

import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { UserModel } from "../models/User.model";
import { PasswordReset } from "../models/passwordReset.model";
import { sendTestEmail } from "../services/sendgrid";

const router = Router();

/**
 * ======================================================
 * GET /api/auth/me
 * ======================================================
 * Check current login status
 */
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", async (req, res) => {
  const userId = (req.session as any)?.userId;

  if (!userId) {
    return res.json(null);
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    return res.json(null);
  }

  return res.json({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });
});

/**
 * ======================================================
 * POST /api/auth/forgot-password
 * ======================================================
 * Send reset password email
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const responseMessage =
      "If this email exists, a reset link has been sent.";

    if (!email) {
      return res.json({ message: responseMessage });
    }

    const user = await UserModel.findOne({ email });

    console.log("🔍 FORGOT PASSWORD EMAIL:", email);
    console.log("🔍 USER FOUND:", !!user);

    if (!user) {
      return res.json({ message: responseMessage });
    }

    // 🔐 每次重置前，清除旧的 reset token（防止多 token 并存）
    await PasswordReset.deleteMany({ userId: user._id });

    // 1️⃣ 生成原始 token（给用户）
    const rawToken = crypto.randomBytes(32).toString("hex");

    // 2️⃣ hash token（存数据库）
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 3️⃣ 设置过期时间（15 分钟）
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordReset.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    // ⚠️ 统一使用 FRONTEND_PUBLIC_URL
    const resetLink = `${process.env.FRONTEND_PUBLIC_URL}/reset-password?token=${rawToken}`;


    console.log("🚀 ABOUT TO SEND RESET EMAIL TO:", user.email);
    console.log("🔗 RESET LINK:", resetLink);

    await sendTestEmail(user.email, {
      subject: "Reset your ShopFlow password",
      html: `
        <p>Hi,</p>
        <p>We received a request to reset your ShopFlow password.</p>
        <p>
          <a href="${resetLink}">
            Click here to reset your password
          </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      `,
      text: `Reset your password: ${resetLink}`,
    });

    return res.json({ message: responseMessage });
  } catch (err) {
    console.error("❌ forgot-password error:", err);
    return res.status(500).json({
      message: "Failed to process forgot password",
    });
  }
});

/**
 * ======================================================
 * POST /api/auth/reset-password
 * ======================================================
 * Reset password with token
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    // 🔐 后端兜底密码校验
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // 1️⃣ hash incoming token
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2️⃣ 查找有效 reset 记录
    const resetRecord = await PasswordReset.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // 3️⃣ hash 新密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ 更新用户密码
    const updatedUser = await UserModel.findByIdAndUpdate(
      resetRecord.userId,
      { passwordHash },
      { new: true }
    );

    console.log(
      "🔐 UPDATED USER PASSWORD HASH =",
      updatedUser?.passwordHash
    );


    // 5️⃣ 删除 reset token（一次性使用）
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    return res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("❌ reset-password error:", err);
    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
});

export default router;
