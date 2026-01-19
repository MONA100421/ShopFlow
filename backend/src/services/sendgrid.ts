import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendTestEmail(
  to: string,
  options: {
    subject: string;
    html: string;
  }
) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL as string,
    subject: options.subject,
    html: options.html,
  };

  await sgMail.send(msg);
}
