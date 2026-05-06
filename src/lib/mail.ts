import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a workflow-related email using Resend.
 * Defaults to a safe sender address if none is provided.
 */
export async function sendWorkflowEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Mail] Skipping email: RESEND_API_KEY not set');
    return { success: false, error: 'API key missing' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || 'Englivo <noreply@updates.englivo.com>',
      to: [to],
      subject,
      html: `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; min-height: 100%; width: 100%;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            <!-- Colorful Top Accent -->
            <div style="height: 6px; background: linear-gradient(90deg, #4f46e5 0%, #818cf8 50%, #c7d2fe 100%);"></div>
            
            <!-- Branding Header -->
            <div style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <span style="font-size: 26px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px;">
                eng<span style="color: #4f46e5;">livo</span>
              </span>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; margin-top: 4px;">
                Vaidik Tutoring Network
              </div>
            </div>
            
            <!-- Core Content Body -->
            <div style="padding: 40px 32px;">
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px; line-height: 1.3;">
                ${subject}
              </h2>
              <div style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                ${html}
              </div>
            </div>
            
            <!-- Footer Branding Block -->
            <div style="background-color: #f8fafc; padding: 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <div style="margin-bottom: 16px;">
                <a href="https://englivo.com" style="color: #4f46e5; font-size: 13px; font-weight: 700; text-decoration: none; margin: 0 10px;">Website</a>
                <span style="color: #cbd5e1;">&bull;</span>
                <a href="https://englivo.com/tutor/dashboard" style="color: #4f46e5; font-size: 13px; font-weight: 700; text-decoration: none; margin: 0 10px;">Dashboard</a>
                <span style="color: #cbd5e1;">&bull;</span>
                <a href="mailto:support@englivo.com" style="color: #4f46e5; font-size: 13px; font-weight: 700; text-decoration: none; margin: 0 10px;">Support</a>
              </div>
              <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">
                This is an automated operational transmission from the Englivo Platform.<br />
                To manage notification preferences, visit your dashboard profile settings.
              </p>
              <p style="font-size: 10px; color: #cbd5e1; margin-top: 16px; font-weight: 500;">
                &copy; ${new Date().getFullYear()} Englivo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[MailError]', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[MailException]', err);
    return { success: false, error: err };
  }
}
