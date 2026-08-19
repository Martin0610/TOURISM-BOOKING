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

export const sendVipAnnouncementEmail = async (
  email: string,
  details: {
    title: string;
    message: string;
    couponCode?: string | null;
    discount?: string | null;
  }
): Promise<void> => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tourism-booking-murex.vercel.app';

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${details.title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0b0f19;font-family:Arial,Helvetica,sans-serif;font-style:normal;-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0f19;padding:40px 10px;font-family:Arial,Helvetica,sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:600px;background:#111827;border-radius:20px;overflow:hidden;border:1px solid #1f2937;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
            
            <!-- VIP Header Banner -->
            <tr>
              <td style="background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);padding:36px 30px;text-align:center;border-bottom:1px solid #374151;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <!-- Single Line Pill with only star emoji -->
                      <div style="display:inline-block;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.4);border-radius:50px;padding:7px 22px;margin-bottom:16px;white-space:nowrap;">
                        <span style="color:#fbbf24;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap;display:inline-block;line-height:1;">
                          ⭐ VIP CLUB EXCLUSIVE DROP ⭐
                        </span>
                      </div>
                      <h1 style="color:#ffffff;margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;">
                        TripEase Private Collection
                      </h1>
                      <p style="color:#cbd5e1;margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.3px;">
                        Curated Holiday Privileges for Verified VIP Members
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Email Body -->
            <tr>
              <td style="padding:36px 30px;">
                
                <!-- Announcement Title -->
                <h2 style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:700;margin:0 0 14px;line-height:1.4;">
                  ${details.title}
                </h2>

                <!-- Main Message -->
                <p style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;margin:0 0 24px;">
                  ${details.message.replace(/\n/g, '<br/>')}
                </p>

                <!-- Secret VIP Discount Box -->
                ${(details.couponCode || details.discount) ? `
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:26px;">
                  <tr>
                    <td style="background:rgba(245,158,11,0.06);border:1.5px dashed #f59e0b;border-radius:14px;padding:22px;text-align:center;">
                      ${details.discount ? `
                        <div style="display:inline-block;background:#f59e0b;color:#000000;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:12px;padding:4px 14px;border-radius:16px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
                          ${details.discount}
                        </div>
                      ` : ''}
                      
                      ${details.couponCode ? `
                        <p style="color:#e2e8f0;font-family:Arial,Helvetica,sans-serif;font-size:12px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                          Your Secret VIP Promo Code
                        </p>
                        <div style="display:inline-block;background:#000000;border:1px solid #f59e0b;padding:10px 24px;border-radius:10px;margin-bottom:8px;">
                          <span style="font-family:Courier,monospace;font-size:22px;font-weight:700;color:#fbbf24;letter-spacing:4px;">
                            ${details.couponCode}
                          </span>
                        </div>
                        <p style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:12px;margin:6px 0 0;">
                          Apply this code during checkout to unlock VIP pricing.
                        </p>
                      ` : ''}
                    </td>
                  </tr>
                </table>
                ` : ''}

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                  <tr>
                    <td align="center">
                      <a href="${appUrl}/packages" target="_blank" style="display:inline-block;background:#f59e0b;color:#000000;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;padding:15px 34px;border-radius:10px;letter-spacing:0.5px;text-align:center;">
                        Explore Packages and Claim Deal
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- VIP Perks List -->
                <div style="background:#1e293b;border-radius:14px;padding:18px 20px;margin-bottom:22px;border:1px solid #334155;">
                  <h4 style="color:#f8fafc;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">
                    Your Active VIP Benefits:
                  </h4>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="color:#cbd5e1;font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:4px 0;line-height:1.5;">
                        • <strong>24/7 Dedicated Support:</strong> Instant WhatsApp and booking management assistance.
                      </td>
                    </tr>
                    <tr>
                      <td style="color:#cbd5e1;font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:4px 0;line-height:1.5;">
                        • <strong>Guaranteed Savings:</strong> Stackable coupon codes with zero hidden surcharges.
                      </td>
                    </tr>
                    <tr>
                      <td style="color:#cbd5e1;font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:4px 0;line-height:1.5;">
                        • <strong>Instant Digital E-Pass:</strong> Digital boarding passes and refundable cancellation.
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Support & Contact -->
                <p style="color:#64748b;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;margin:0;text-align:center;">
                  Need assistance with your booking? Reply to this email or contact support at <a href="mailto:mjv3140@gmail.com" style="color:#38bdf8;text-decoration:none;">mjv3140@gmail.com</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#0a0f1d;padding:22px 30px;text-align:center;border-top:1px solid #1e293b;">
                <p style="color:#64748b;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;margin:0 0 6px;">
                  You are receiving this private dispatch because your account is a verified <strong>TripEase VIP Member</strong>.
                </p>
                <p style="color:#475569;font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:0;">
                  © 2026 TripEase Holidays Pvt. Ltd. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `TripEase VIP Club <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `TripEase VIP: ${details.title}`,
    html,
  });
};
