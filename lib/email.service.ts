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

export const sendBookingConfirmation = async (
  email: string,
  userName: string,
  details: {
    packageName: string;
    destination: string;
    travelDate: string;
    numberOfPeople: number;
    totalAmount: number;
    bookingId: string;
  }
): Promise<void> => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:26px;">TripEase</h1>
        <p style="color:#f9a8d4;margin:8px 0 0;font-size:14px;">Your booking is confirmed!</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px;">
        <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi ${userName},</p>
        <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.6;">
          Great news! Your payment was successful and your booking is confirmed. Here are your trip details:
        </p>

        <!-- Booking Details -->
        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;width:40%;">Package</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${details.packageName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Destination</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;">${details.destination}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Travel Date</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;">${details.travelDate}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">No. of People</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;">${details.numberOfPeople}</td>
            </tr>
            <tr style="border-top:2px solid #e5e7eb;">
              <td style="padding:12px 0 0;color:#6b7280;font-size:14px;font-weight:600;">Amount Paid</td>
              <td style="padding:12px 0 0;color:#7c3aed;font-size:18px;font-weight:700;">₹${details.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <!-- Success message -->
        <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:12px 16px;margin-bottom:24px;">
          <p style="margin:0;color:#065f46;font-size:13px;line-height:1.6;">
            Payment successful · Booking ID: <strong>${details.bookingId.slice(0, 8).toUpperCase()}</strong>
          </p>
        </div>

        <p style="color:#374151;font-size:14px;line-height:1.6;">
          Have questions or need help? We're here for you.
        </p>
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:24px 0 0;">
          Contact us at <a href="mailto:mjv3140@gmail.com" style="color:#7c3aed;text-decoration:none;">mjv3140@gmail.com</a> | +91 72003 36447
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
    from: `TripEase <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Booking Confirmed — ${details.packageName}`,
    html,
  });
};

export const sendCancellationEmail = async (
  email: string,
  userName: string,
  details: {
    packageName: string;
    destination: string;
    travelDate: string;
    numberOfPeople: number;
    totalAmount: number;
    bookingId: string;
    refundApplicable: boolean;
  }
): Promise<void> => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#dc2626,#9f1239);padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:26px;">TripEase</h1>
        <p style="color:#fca5a5;margin:8px 0 0;font-size:14px;">Booking Cancellation Confirmation</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px;">
        <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi ${userName},</p>
        <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.6;">
          Your booking has been successfully cancelled. Here are the details:
        </p>

        <!-- Booking Details -->
        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;width:40%;">Package</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${details.packageName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Destination</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;">${details.destination}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Travel Date</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;">${details.travelDate}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">No. of People</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;">${details.numberOfPeople}</td>
            </tr>
            <tr style="border-top:2px solid #e5e7eb;">
              <td style="padding:12px 0 0;color:#6b7280;font-size:14px;font-weight:600;">Amount Paid</td>
              <td style="padding:12px 0 0;color:#dc2626;font-size:18px;font-weight:700;">₹${details.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <!-- Refund Info -->
        ${details.refundApplicable ? `
        <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:16px;margin-bottom:24px;border-radius:4px;">
          <p style="margin:0 0 6px;color:#065f46;font-size:14px;font-weight:600;">Refund Initiated</p>
          <p style="margin:0;color:#065f46;font-size:13px;line-height:1.6;">
            A full refund of <strong>₹${details.totalAmount.toLocaleString('en-IN')}</strong> has been initiated to your original payment method.
            It will be credited within <strong>5–7 business days</strong>.
          </p>
        </div>
        ` : `
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin-bottom:24px;border-radius:4px;">
          <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
            This booking was cancelled but no payment was made, so no refund is applicable.
          </p>
        </div>
        `}

        <div style="background:#f9fafb;border-radius:4px;padding:12px 16px;margin-bottom:24px;">
          <p style="margin:0;color:#6b7280;font-size:13px;">
            Booking ID: <strong style="color:#374151;">${details.bookingId.slice(0, 8).toUpperCase()}</strong>
          </p>
        </div>

        <p style="color:#374151;font-size:14px;line-height:1.6;">
          We're sorry to see you go. If you have any questions about your refund or need further assistance, feel free to reach out.
        </p>
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:24px 0 0;">
          Contact us at <a href="mailto:mjv3140@gmail.com" style="color:#7c3aed;text-decoration:none;">mjv3140@gmail.com</a> | +91 72003 36447
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
    from: `TripEase <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Booking Cancelled — ${details.packageName}`,
    html,
  });
};
