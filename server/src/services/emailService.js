const emailHtml = (code) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 20px; text-align: center; background-color: #ffffff;">
    <h2 style="color: #0d9488;">Verification Code</h2>
    <p style="color: #64748b; font-size: 16px;">Use the following code to verify your email address:</p>
    <div style="margin: 40px 0;">
      <span style="background-color: #f0fdfa; color: #0d9488; font-size: 42px; font-weight: 900; letter-spacing: 10px; padding: 20px 40px; border-radius: 15px; border: 2px dashed #0d9488;">${code}</span>
    </div>
    <p style="color: #94a3b8; font-size: 14px;">This code expires in 10 minutes.</p>
    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
    <p style="font-size: 12px; color: #cbd5e1;">&copy; 2026 Slouma Health. All rights reserved.</p>
  </div>
`;

const inviteEmailHtml = (inviteLink, name) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 20px; text-align: center; background-color: #ffffff;">
    <h2 style="color: #0d9488;">Welcome to Slouma Health!</h2>
    <p style="color: #64748b; font-size: 16px;">Hello ${name},</p>
    <p style="color: #64748b; font-size: 16px;">An admin has created an account for you. Click the button below to set your password and activate your account.</p>
    <div style="margin: 40px 0;">
      <a href="${inviteLink}" style="background-color: #0d9488; color: #ffffff; font-size: 18px; font-weight: 700; padding: 16px 40px; border-radius: 12px; text-decoration: none; display: inline-block;">Set Your Password</a>
    </div>
    <p style="color: #94a3b8; font-size: 14px;">This link expires in 48 hours.</p>
    <p style="color: #94a3b8; font-size: 14px;">If you did not expect this invitation, you can ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
    <p style="font-size: 12px; color: #cbd5e1;">&copy; 2026 Slouma Health. All rights reserved.</p>
  </div>
`;

const sendResendEmail = async (email, subject, htmlContent) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 'your-resend-api-key') return null;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [email],
        subject,
        html: htmlContent,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Resend email failed:', data.message || data.error);
      return null;
    }
    console.log('Email sent via Resend to', email, '— ID:', data.id);
    return { status: 'success', messageId: data.id };
  } catch (error) {
    console.error('Resend email failed:', error.message);
    return null;
  }
};

const sendBrevoEmail = async (email, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey === 'your-brevo-api-key') return null;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: process.env.EMAIL_FROM || 'noreply@slouma.tn', name: 'Slouma Health' },
        to: [{ email }],
        subject,
        htmlContent,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Brevo email failed:', data.message);
      return null;
    }
    console.log('Email sent via Brevo to', email, '— ID:', data.messageId);
    return { status: 'success', messageId: data.messageId };
  } catch (error) {
    console.error('Brevo email failed:', error.message);
    return null;
  }
};

const sendEmail = async (email, subject, htmlContent) => {
  const result = await sendResendEmail(email, subject, htmlContent);
  if (result) return result;

  const result2 = await sendBrevoEmail(email, subject, htmlContent);
  if (result2) return result2;

  console.log('Dev mode — no email provider configured');
  return { status: 'dev-mode' };
};

export const sendInviteEmail = async (email, inviteLink, name) => {
  const result = await sendEmail(
    email,
    "You're invited to Slouma Health \u2014 Set Your Password",
    inviteEmailHtml(inviteLink, name)
  );
  if (result.status === 'dev-mode') {
    console.log(`Invite link for ${email} (${name}): ${inviteLink}`);
    return { status: 'dev-mode', link: inviteLink };
  }
  return result;
};

export const sendVerificationEmail = async (email, code) => {
  const result = await sendEmail(email, 'Verification Code - Slouma Health', emailHtml(code));
  if (result.status === 'dev-mode') {
    console.log(`Verification code for ${email}: ${code}`);
    return { status: 'dev-mode', code };
  }
  return { ...result, code };
};
