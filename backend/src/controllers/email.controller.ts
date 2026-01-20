import { Request, Response } from "express";
import { sendTestEmail } from "../services/sendgrid";

export async function sendTestEmailController(
  req: Request,
  res: Response
) {
  const { email, name, resetUrl } = req.body;

  if (!email || !resetUrl) {
    return res.status(400).json({
      message: "email and resetUrl are required",
    });
  }

  try {
    const subject = "Let’s reset your ShopFlow password";

    const textContent = `
Hi ${name || "there"},

No worries — we received a request to reset the password for your ShopFlow account.

If this was you, just use the link below to set a new password:
${resetUrl}

For your security, this link will expire in 15 minutes.

If you didn’t request a password reset, you can safely ignore this email.
Your account will remain unchanged.

Take care,
The ShopFlow Team
`.trim();

    const htmlContent = `
<p>Hi ${name || "there"},</p>

<p>
  No worries — we received a request to reset the password for your
  <strong>ShopFlow</strong> account.
</p>

<p>
  If this was you, click the button below to set a new password.
</p>

<p>
  <a
    href="${resetUrl}"
    style="
      display: inline-block;
      padding: 12px 22px;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    "
  >
    Reset Password
  </a>
</p>

<p style="color: #555;">
  For your security, this link will expire in 15 minutes.
</p>

<p>
  If you didn’t request a password reset, you can safely ignore this email.
  Your account will remain unchanged.
</p>

<p>
  Take care,<br />
  <strong>The ShopFlow Team</strong>
</p>
`;

    await sendTestEmail(email, {
  subject,
  text: textContent,
  html: htmlContent,
});


    return res.json({ success: true });
  } catch (error: any) {
    console.error("SendGrid ERROR full:", error);
    console.error("SendGrid ERROR response:", error?.response?.body);

    return res.status(500).json({
      message: "Failed to send email",
      sendgridError: error?.response?.body,
    });
  }
}
