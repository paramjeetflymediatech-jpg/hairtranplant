import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { Lead, Clinic } from '@/db/models';

export async function POST(req: Request) {
  try {
    const { name, clinicName, email, message } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    // Fetch primary clinic to link the lead to (required for foreign key constraints)
    const firstClinic = await Clinic.findOne();
    const clinicId = firstClinic ? firstClinic.id : 'default-clinic-id';

    // Write contact inquiry to the database leads table
    await Lead.create({
      clinicId,
      name,
      email,
      phone: '',
      source: 'Website Contact Form',
      status: 'NEW',
      notes: `Clinic: ${clinicName || 'Not Specified'}. Message: ${message || 'No message provided.'}`,
    });

    // Fetch secret multiple recipients from environment or fallback
    // BCC hides the recipient identity of other carbon copies completely.
    const recipientEmails = process.env.CONTACT_RECIPIENTS 
      ? process.env.CONTACT_RECIPIENTS.split(',').map(e => e.trim())
      : ['admin@graftdesk.com', 'sales@graftdesk.com', 'support@graftdesk.com'];

    // Email 1: Sent directly to the client as a receipt confirmation
    const clientHtmlContent = `
      <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #0d9488; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 800;">Contact Query Received</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #475569; font-weight: 500;">
          Hi ${name},<br/><br/>
          Thank you for reaching out to GraftDesk. Your query has been successfully submitted, and our team will contact you shortly.
        </p>
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Sender Name:</strong> <span style="color: #0f172a;">${name}</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Clinic/Practice:</strong> <span style="color: #0f172a;">${clinicName || 'Not Specified'}</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Email Address:</strong> <span style="color: #0f172a;">${email}</span></p>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;"><strong>Your Message Details:</strong></p>
        <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 14px; border-radius: 0 8px 8px 0; font-style: italic; font-size: 13px; color: #0f766e; margin-bottom: 24px;">
          "${message || 'I would like to speak with a systems consultant.'}"
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This is an automated confirmation of your query submission.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: `GraftDesk Query Received - Our team will contact you shortly`,
      html: clientHtmlContent,
    });

    // Email 2: Sent separately to admins as a new lead alert notification
    const adminHtmlContent = `
      <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #e11d48; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 800;">🚨 New Lead Alert - Action Required</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #475569;">
          A new demo request / contact inquiry has been submitted. Please review details below and follow up within SLA guidelines.
        </p>
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Lead Name:</strong> <span style="color: #0f172a; font-weight: 600;">${name}</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Clinic Name:</strong> <span style="color: #0f172a; font-weight: 600;">${clinicName || 'Not Specified'}</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Contact Email:</strong> <span style="color: #0f172a; font-weight: 600;">${email}</span></p>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;"><strong>Inquiry Message:</strong></p>
        <div style="background: #fff1f2; border-left: 4px solid #f43f5e; padding: 14px; border-radius: 0 8px 8px 0; font-style: italic; font-size: 13px; color: #9f1239; margin-bottom: 24px;">
          "${message || 'No message provided.'}"
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Lead routed automatically via GraftDesk CRM router. BCC delivery prevents recipient disclosure.</p>
      </div>
    `;

    const info = await sendEmail({
      to: 'inbound-leads@graftdesk.com',
      bcc: recipientEmails,
      subject: `🚨 [New Lead Inquiry] ${name} - ${clinicName || 'Independent'}`,
      html: adminHtmlContent,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Nodemailer API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch email' }, { status: 500 });
  }
}
