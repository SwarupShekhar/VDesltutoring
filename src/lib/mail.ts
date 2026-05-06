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
      from: 'Vaidik Tutoring <onboarding@resend.dev>', // Default Resend test domain if not verified
      to: [to],
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1a1a1a;">${subject}</h2>
          <div style="color: #444; line-height: 1.6;">
            ${html}
          </div>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">
            This is an automated notification from the Vaidik Tutoring Platform.
          </p>
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
