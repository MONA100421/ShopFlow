import { Router } from "express";
import crypto from "crypto";
import { UserModel } from "../models/User.model";
import { PasswordReset } from "../models/passwordReset.model";
import { sendTestEmail } from "../services/sendgrid";

import bcrypt from "bcryptjs";

const router = Router();

/**
 * Forgot password
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const responseMessage =
    "If this email exists, a reset link has been sent";

  if (!email) {
    return res.json({ message: responseMessage });
  }

  const user = await UserModel.findOne({ email });

  console.log("🔍 FORGOT PASSWORD EMAIL:", email);
  console.log("🔍 USER FOUND:", !!user);

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordReset.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    console.log("🚀 ABOUT TO SEND RESET EMAIL TO:", user.email);

    await sendTestEmail(user.email, {
      subject: "SendGrid works!",
      html: `
        <h2>SendGrid works!</h2>
        <p>This is a password reset test.</p>
        <p>Reset link:</p>
        <p>${resetLink}</p>
      `,
      text: `Reset link: ${resetLink}`,
    });

    console.log("RESET PASSWORD LINK:", resetLink);
  }

  return res.json({ message: responseMessage });
});

/**
 * STEP 3.2.1
 * Reset password - API skeleton
 */
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      message: "Invalid request",
    });
  }

  // 1️⃣ hash incoming token
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 2️⃣ find reset record
  const resetRecord = await PasswordReset.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    return res.status(400).json({
      message: "Invalid or expired reset token",
    });
  }

  // 🔐 STEP 3.2.3 START
  // 3️⃣ hash new password
  const passwordHash = await bcrypt.hash(password, 10);

  // 4️⃣ update user password
  await UserModel.findByIdAndUpdate(resetRecord.userId, {
    passwordHash,
  });
  await PasswordReset.deleteOne({ _id: resetRecord._id });
  
  return res.json({
    message: "password updated",
  });
});



export default router;
