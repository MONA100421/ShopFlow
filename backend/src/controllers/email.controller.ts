import { Request, Response } from "express";
import { sendTestEmail } from "../services/sendgrid";

export async function sendTestEmailController(
  req: Request,
  res: Response
) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "email is required",
    });
  }

  try {
    await sendTestEmail(email, {
        subject: "SendGrid test email",
        html: `
            <h2>SendGrid works!</h2>
            <p>This is a test email from your backend.</p>
        `,
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
