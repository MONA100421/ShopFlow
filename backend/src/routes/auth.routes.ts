import { Router } from "express";
import crypto from "crypto";
import { UserModel } from "../models/User.model";
import { PasswordReset } from "../models/passwordReset.model";
import { sendTestEmail } from "../services/sendgrid";

const router = Router();

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
    // 1️⃣ raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // 2️⃣ hash token
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // 3️⃣ expires
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 4️⃣ store in DB
    await PasswordReset.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    // 5️⃣ reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    console.log("🚀 ABOUT TO SEND RESET EMAIL TO:", user.email);
    
    // 6️⃣ send email（⚠️ 一定要在 if 裡）
    await sendTestEmail(user.email, {
      subject: "Reset your password",
      html: `
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    console.log("RESET PASSWORD LINK:", resetLink);
  }

  return res.json({ message: responseMessage });
});

export default router;
