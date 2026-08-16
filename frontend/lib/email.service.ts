import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetOTP = async (email: string, otp: string, userName: string): Promise<void> => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px 40px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:28px;letter-spacing:-0.5px;">🌍 TripEase</h1>
        <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Password Reset Request</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 40px;">
        <p style="color:#374151;font-size:16px;margin:0 0 24px;">Hi <strong>${userName}</strong>,</p>
        <p style="color:#374151;font-size:15px;margin:0 0 24px;">
          We received a request to reset your password. Use the OTP below to reset your password:
        </p>

        <!-- OTP Box -->
        <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="color:#bfdbfe;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your OTP Code</p>
          <h2 style="color:white;margin:0;font-size:36px;font-weight:bold;letter-spacing:8px;">${otp}</h2>
          <p style="color:#dbeafe;margin:8px 0 0;font-size:13px;">Valid for 10 minutes</p>
        </div>

        <!-- Warning -->
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6;">
            ⚠️ If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>

        <!-- Support -->
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:0;">
          Questions? Contact us at <a href="mailto:mjv3140@gmail.com" style="color:#2563eb;">mjv3140@gmail.com</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 TripEase · Secure password reset</p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'TripEase <noreply@tripease.com>',
    to: email,
    subject: '🔐 Password Reset OTP — TripEase',
    html,
  });
};

export const sendVerificationOTP = async (email: string, otp: string, userName: string): Promise<void> => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px 40px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:28px;letter-spacing:-0.5px;">🌍 TripEase</h1>
        <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;">Welcome! Verify Your Email</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 40px;">
        <p style="color:#374151;font-size:16px;margin:0 0 24px;">Hi <strong>${userName}</strong>,</p>
        <p style="color:#374151;font-size:15px;margin:0 0 24px;">
          Welcome to TripEase! To complete your registration, please verify your email address using the OTP below:
        </p>

        <!-- OTP Box -->
        <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="color:#d1fae5;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Verification Code</p>
          <h2 style="color:white;margin:0;font-size:36px;font-weight:bold;letter-spacing:8px;">${otp}</h2>
          <p style="color:#d1fae5;margin:8px 0 0;font-size:13px;">Valid for 10 minutes</p>
        </div>

        <!-- Info -->
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;color:#065f46;font-size:13px;line-height:1.6;">
            ✅ Once verified, you'll be able to login and start booking amazing travel packages across India!
          </p>
        </div>

        <!-- Warning -->
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6;">
            ⚠️ If you didn't create an account with TripEase, please ignore this email.
          </p>
        </div>

        <!-- Support -->
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:0;">
          Questions? Contact us at <a href="mailto:mjv3140@gmail.com" style="color:#10b981;">mjv3140@gmail.com</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 TripEase · Secure email verification</p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'TripEase <noreply@tripease.com>',
    to: email,
    subject: '✅ Verify Your Email — TripEase',
    html,
  });
};
