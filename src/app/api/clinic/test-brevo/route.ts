import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || !session.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { apiKey, senderEmail, senderName, recipientEmail } = await req.json();

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ error: 'Brevo API key is required to send a test email.' }, { status: 400 });
    }

    if (!recipientEmail || !recipientEmail.trim() || !recipientEmail.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid recipient email address.' }, { status: 400 });
    }

    const sender = {
      name: senderName && senderName.trim() ? senderName.trim() : 'GraftDesk Clinic Admin',
      email: senderEmail && senderEmail.trim() ? senderEmail.trim() : recipientEmail.trim(),
    };

    // Call Brevo v3 REST API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey.trim(),
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [{ email: recipientEmail.trim(), name: 'Test Recipient' }],
        subject: '⚡ Brevo Email Integration Test — GraftDesk SaaS',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #0d9488; margin-top: 0;">✅ Brevo Email Integration Verified!</h2>
            <p style="color: #334155; font-size: 14px;">Your Brevo transactional email integration is working perfectly!</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <table style="width: 100%; font-size: 13px; color: #475569;">
              <tr><td style="font-weight: bold; width: 140px;">Sender Name:</td><td>${sender.name}</td></tr>
              <tr><td style="font-weight: bold;">Sender Email:</td><td>${sender.email}</td></tr>
              <tr><td style="font-weight: bold;">Recipient:</td><td>${recipientEmail.trim()}</td></tr>
              <tr><td style="font-weight: bold;">Timestamp:</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
            <p style="color: #94a3b8; font-size: 11px; margin-top: 20px;">Sent automatically via GraftDesk SaaS Brevo Integration Module.</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.code || 'Failed to dispatch email via Brevo API. Please check your API Key and Sender Email authorization.' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data.messageId,
      message: `Test email successfully sent to ${recipientEmail}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error while testing Brevo API.' }, { status: 500 });
  }
}
