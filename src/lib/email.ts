import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  bcc?: string[];
  subject: string;
  html: string;
}

/**
 * Reusable utility to send emails via Nodemailer with environment configuration.
 * Automatically falls back to a sandbox Ethereal SMTP account if credentials are missing.
 */
export async function sendEmail({ to, bcc, subject, html }: SendEmailOptions) {
  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  let transporter;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Generate test sandbox account dynamically on the fly
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('⚡ Nodemailer Sandbox Mailer Active. Account:', testAccount.user);
  }

  const mailOptions = {
    from: `"GraftDesk Operations" <${transporter.options.auth?.user || 'operations@graftdesk.com'}>`,
    to,
    bcc,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (!user) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('📬 Email Dispatched (Sandbox). View Preview:', previewUrl);
  }

  return info;
}
