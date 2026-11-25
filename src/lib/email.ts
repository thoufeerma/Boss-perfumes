import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

const fromEmail = process.env.FROM_EMAIL || 'Boss Perfumes <no-reply@yourdomain.com>';

/**
 * Tells the order's billing email that a return was filed, so the real customer finds out
 * if someone else used their order number and email to file one. Contains no details
 * typed by the requester.
 */
export async function sendReturnRequestNotice(toEmail: string, orderId: number, rmaId: string): Promise<boolean> {
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not configured');
    return false;
  }

  const safeOrderId = String(Number(orderId));
  const safeRmaId = rmaId.replace(/[^A-Za-z0-9-]/g, '');

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Return request received for order #${safeOrderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #111; text-align: center; text-transform: uppercase; letter-spacing: 2px;">Boss Perfumes</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">We have received a return request for your order <strong>#${safeOrderId}</strong> (reference <strong>${safeRmaId}</strong>). Our team will review it and contact you to arrange the next steps.</p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;"><strong>If you did not request this return</strong>, please reply to this email or contact us right away so we can stop it.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">Boss Perfumes</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending return notice email:', error);
    return false;
  }
}

export async function sendOTPEmail(toEmail: string, otpCode: string): Promise<boolean> {
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not configured');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Verify your Boss Perfumes account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #111; text-align: center; text-transform: uppercase; letter-spacing: 2px;">Boss Perfumes</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">Thank you for registering with Boss Perfumes. To complete your registration, please use the verification code below:</p>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; margin: 30px 0; border-radius: 4px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${otpCode}</span>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">This code expires in 5 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}
