import nodemailer from 'nodemailer';

// Bypass self-signed certificate errors common in local development networks (antivirus/firewall proxy interceptions)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let transporter = null;
let testAccount = null;

const createTransporter = async () => {
  if (transporter) return transporter;
  
  const hasUser = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-gmail@gmail.com';
  const hasPass = process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your-app-password';

  if (hasUser && hasPass) {
    try {
      // Use robust SMTP configuration for Gmail or custom SMTP
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '465', 10),
        secure: process.env.EMAIL_SECURE !== 'false', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false // Bypasses certificate errors (e.g. self-signed certs behind firewalls/proxies)
        }
      });
      console.log('✅ Real SMTP transporter configured successfully for:', process.env.EMAIL_USER);
    } catch (error) {
      console.error('❌ Failed to create real SMTP transporter:', error.message);
    }
  } else {
    // Zero-config developer fallback using Ethereal Email Sandbox
    try {
      console.log('🔄 Creating automatic Ethereal SMTP test account...');
      testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('✉️ Created Ethereal Test Account:', testAccount.user);
    } catch (error) {
      console.error('❌ Failed to generate automatic Ethereal SMTP sandbox:', error.message);
    }
  }
  
  return transporter;
};

export const sendVerificationEmail = async (email, code) => {
  try {
    const mailTransporter = await createTransporter();
    if (!mailTransporter) {
      console.log(`\n🔔 [SANDBOX FALLBACK] EMAIL VERIFICATION CODE FOR ${email}: ${code}\n`);
      return { status: 'dev-mode', code };
    }

    const mailOptions = {
      from: `"Slouma Health" <${process.env.EMAIL_USER || 'no-reply@slouma-health.com'}>`,
      to: email,
      subject: 'Verification Code - Slouma Health',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 20px; text-align: center; background-color: #ffffff;">
          <h2 style="color: #0d9488; margin-bottom: 20px;">Verification Code</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Thank you for registering with Slouma Health. Please use the following code to verify your email address:</p>
          <div style="margin: 40px 0;">
            <span style="background-color: #f0fdfa; color: #0d9488; font-size: 42px; font-weight: 900; letter-spacing: 10px; padding: 20px 40px; border-radius: 15px; border: 2px dashed #0d9488;">${code}</span>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
          <p style="font-size: 12px; color: #cbd5e1;">&copy; 2026 Slouma Health. All rights reserved.</p>
        </div>
      `,
    };

    const info = await mailTransporter.sendMail(mailOptions);

    // If using ethereal, extract direct preview URL
    if (mailTransporter.options.host === 'smtp.ethereal.email') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`✉️ Ethereal Preview URL: ${previewUrl}`);
      return { status: 'dev-mode', code, previewUrl };
    }

    console.log(`📧 Verification email successfully sent to ${email}. Message ID: ${info.messageId}`);
    return { status: 'success', messageId: info.messageId };
  } catch (error) {
    console.log(`\n🔔 [SANDBOX FALLBACK] EMAIL VERIFICATION CODE FOR ${email}: ${code}\n`);
    console.error('Email error:', error.message);
    return { status: 'fallback-mode', code, error: error.message };
  }
};
