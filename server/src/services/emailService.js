import nodemailer from 'nodemailer';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let transporter = null;

const isRealCredentials = () => {
  return (
    process.env.EMAIL_USER &&
    process.env.EMAIL_USER !== 'your-gmail@gmail.com' &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_PASS !== 'your-app-password'
  );
};

const createTransporter = async () => {
  if (transporter) return transporter;

  if (isRealCredentials()) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '465', 10),
      secure: process.env.EMAIL_SECURE !== 'false',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
    console.log('✅ Real SMTP transporter configured for:', process.env.EMAIL_USER);
  } else {
    console.log('🔄 Creating Ethereal sandbox account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('✉️ Ethereal account created:', testAccount.user);
  }

  return transporter;
};

export const sendVerificationEmail = async (email, code) => {
  try {
    const mailTransporter = await createTransporter();

    const info = await mailTransporter.sendMail({
      from: `"Slouma Health" <${process.env.EMAIL_USER || 'no-reply@slouma-health.com'}>`,
      to: email,
      subject: 'Verification Code - Slouma Health',
      html: `
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
      `,
    });

    if (!isRealCredentials()) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('✉️ Ethereal Preview URL:', previewUrl);
      return { status: 'dev-mode', code, previewUrl };
    }

    console.log('📧 Email sent to', email, '— Message ID:', info.messageId);
    return { status: 'success', messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { status: 'fallback-mode', code, error: error.message };
  }
};
