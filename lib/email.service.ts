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
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#2563eb;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">TripEase</h1>
        <p style="color:#dbeafe;margin:8px 0 0;font-size:14px;">Password Reset Request</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px;">
        <p style="color:#374151;font-size:16px;margin:0 0 16px;">Hello ${userName},</p>
        <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.6;">
          We received a request to reset your password. Please use the OTP below to complete the password reset process:
        </p>

        <!-- OTP Box -->
        <div style="background:#f3f4f6;border:2px solid #2563eb;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
          <p style="color:#6b7280;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your OTP Code</p>
          <h2 style="color:#1e40af;margin:0;font-size:32px;font-weight:bold;letter-spacing:6px;">${otp}</h2>
          <p style="color:#6b7280;margin:8px 0 0;font-size:13px;">Valid for 10 minutes</p>
        </div>

        <!-- Warning -->
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;margin-bottom:24px;">
          <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>

        <!-- Support -->
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:24px 0 0;">
          Questions? Contact us at <a href="mailto:mjv3140@gmail.com" style="color:#2563eb;text-decoration:none;">mjv3140@gmail.com</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 TripEase. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'TripEase <noreply@tripease.com>',
    to: email,
    subject: 'Password Reset OTP - TripEase',
    html,
  });
};

export const sendVerificationOTP = async (email: string, otp: string, userName: string): Promise<void> => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#2563eb;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">TripEase</h1>
        <p style="color:#dbeafe;margin:8px 0 0;font-size:14px;">Email Verification</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px;">
        <p style="color:#374151;font-size:16px;margin:0 0 16px;">Hello ${userName},</p>
        <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.6;">
          Welcome to TripEase! To complete your registration and start booking amazing travel packages, please verify your email address using the OTP below:
        </p>

        <!-- OTP Box -->
        <div style="background:#f3f4f6;border:2px solid #2563eb;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
          <p style="color:#6b7280;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Verification Code</p>
          <h2 style="color:#1e40af;margin:0;font-size:32px;font-weight:bold;letter-spacing:6px;">${otp}</h2>
          <p style="color:#6b7280;margin:8px 0 0;font-size:13px;">Valid for 10 minutes</p>
        </div>

        <!-- Info -->
        <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:12px 16px;margin-bottom:24px;">
          <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.6;">
            Once verified, you will be able to login and explore our curated travel packages across India.
          </p>
        </div>

        <!-- Warning -->
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;margin-bottom:24px;">
          <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
            If you did not create an account with TripEase, please ignore this email.
          </p>
        </div>

        <!-- Support -->
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:24px 0 0;">
          Questions? Contact us at <a href="mailto:mjv3140@gmail.com" style="color:#2563eb;text-decoration:none;">mjv3140@gmail.com</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 TripEase. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'TripEase <noreply@tripease.com>',
    to: email,
    subject: 'Email Verification - TripEase',
    html,
  });
};
