import { BrevoClient } from '@getbrevo/brevo';

const isRealCredentials = () => {
  return (
    process.env.BREVO_API_KEY &&
    process.env.BREVO_API_KEY !== 'your-brevo-api-key'
  );
};

const getBrevoClient = () => {
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
  console.log('✅ Brevo client configured');
  return apiInstance;
};

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

export const sendVerificationEmail = async (email, code) => {
  if (!isRealCredentials()) {
    console.log('🔄 Dev mode — skipping real email send');
    console.log(`📋 Verification code for ${email}: ${code}`);
    return { status: 'dev-mode', code };
  }

  try {
    const apiInstance = getBrevoClient();

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: 'Slouma Health' };
    sendSmtpEmail.subject = 'Verification Code - Slouma Health';
    sendSmtpEmail.htmlContent = emailHtml(code);

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('📧 Email sent to', email, '— Message ID:', response.messageId);
    return { status: 'success', messageId: response.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { status: 'fallback-mode', code, error: error.message };
  }
};
