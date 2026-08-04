import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  bcc?: string[];
  subject: string;
  html: string;
  brevoApiKey?: string;
  brevoSenderEmail?: string;
  brevoSenderName?: string;
}

/**
 * Reusable utility to send emails via Brevo API or Nodemailer (SMTP/Ethereal sandbox).
 */
export async function sendEmail({
  to,
  bcc,
  subject,
  html,
  brevoApiKey,
  brevoSenderEmail,
  brevoSenderName,
}: SendEmailOptions) {
  const apiKey = brevoApiKey || process.env.BREVO_API_KEY;

  if (apiKey) {
    try {
      const senderEmail = brevoSenderEmail || process.env.BREVO_SENDER_EMAIL || 'operations@graftdesk.com';
      const senderName = brevoSenderName || process.env.BREVO_SENDER_NAME || 'GraftDesk Operations';

      const toList = to.split(',').map((e) => ({ email: e.trim() }));
      const bccList = bcc ? bcc.map((e) => ({ email: e.trim() })) : undefined;

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey.trim(),
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: toList,
          bcc: bccList,
          subject,
          htmlContent: html,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        console.log('⚡ Email sent via Brevo API:', resData.messageId);
        return resData;
      }
      console.warn('⚠️ Brevo API warning:', resData.message || resData.code);
    } catch (err) {
      console.error('❌ Brevo email dispatch error, falling back to SMTP:', err);
    }
  }

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
