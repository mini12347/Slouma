import nodemailer from 'nodemailer';

let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
      process.env.EMAIL_USER !== 'your-gmail@gmail.com') {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } catch (error) {
      console.log('Failed to create email transporter:', error.message);
    }
  }
  
  return transporter;
};

export const sendVerificationEmail = async (email, code) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
      process.env.EMAIL_USER === 'your-gmail@gmail.com') {
    console.log(`\n🔔 EMAIL VERIFICATION CODE FOR ${email}: ${code}\n`);
    console.log('Email service not configured. Use the code above for verification.');
    return Promise.resolve({ messageId: 'dev-mode' });
  }

  try {
    const mailTransporter = createTransporter();
    if (!mailTransporter) {
      console.log(`\n🔔 EMAIL VERIFICATION CODE FOR ${email}: ${code}\n`);
      console.log('Email transporter creation failed. Use the code above for verification.');
      return Promise.resolve({ messageId: 'dev-mode' });
    }

    const mailOptions = {
      from: `"Slouma Health" <${process.env.EMAIL_USER}>`,
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

    return await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`\n🔔 EMAIL VERIFICATION CODE FOR ${email}: ${code}\n`);
    console.log('Email sending failed. Use the code above for verification.');
    console.log('Email error:', error.message);
    return Promise.resolve({ messageId: 'fallback-mode' });
  }
};
