import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendTestEmail(
  to: string,
  options: {
    subject: string;
    html: string;
    text?: string; // ✅ 关键：允许 text
  }
) {
  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL as string,
    subject: options.subject,
    html: options.html,
    text: options.text, // ✅ 同步传给 SendGrid
  });
}
