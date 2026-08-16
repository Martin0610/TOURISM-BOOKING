import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface BookingEmailData {
  userName: string;
  userEmail: string;
  packageName: string;
  destination: string;
  state: string;
  travelDate: string;
  numberOfPeople: number;
  departureCity?: string;
  transportMode?: string;
  packageAmount: number;
  transportAmount: number;
  discountAmount: number;
  totalAmount: number;
  bookingId: string;
  cancellationPolicy: string;
}

export const sendBookingConfirmationEmail = async (data: BookingEmailData): Promise<void> => {
  const {
    userName, userEmail, packageName, destination, state, travelDate,
    numberOfPeople, departureCity, transportMode, packageAmount,
    transportAmount, discountAmount, totalAmount, bookingId, cancellationPolicy,
  } = data;

  const discountRow = discountAmount > 0 ? `
    <tr>
      <td style="padding:8px 12px;color:#16a34a;font-weight:bold;">Group Discount (20% off)</td>
      <td style="padding:8px 12px;color:#16a34a;font-weight:bold;text-align:right;">-₹${discountAmount.toLocaleString('en-IN')}</td>
    </tr>` : '';

  const transportRow = transportAmount > 0 ? `
    <tr>
      <td style="padding:8px 12px;color:#374151;">Transport from ${departureCity} (${transportMode})</td>
      <td style="padding:8px 12px;color:#374151;text-align:right;">₹${transportAmount.toLocaleString('en-IN')}</td>
    </tr>` : '';

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px 40px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:28px;letter-spacing:-0.5px;">🌍 TripEase</h1>
        <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Your booking is confirmed!</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 40px;">
        <p style="color:#374151;font-size:16px;margin:0 0 24px;">Hi <strong>${userName}</strong>,</p>
        <p style="color:#374151;font-size:15px;margin:0 0 24px;">
          Your booking for <strong>${packageName}</strong> has been confirmed. Here are your booking details:
        </p>

        <!-- Booking Info -->
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e5e7eb;">
          <h3 style="margin:0 0 16px;color:#1f2937;font-size:16px;">📋 Booking Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Booking ID</td><td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:bold;">${bookingId.slice(-8).toUpperCase()}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Package</td><td style="padding:6px 0;color:#1f2937;font-size:14px;">${packageName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Destination</td><td style="padding:6px 0;color:#1f2937;font-size:14px;">${destination}, ${state}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Travel Date</td><td style="padding:6px 0;color:#1f2937;font-size:14px;">${new Date(travelDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Travellers</td><td style="padding:6px 0;color:#1f2937;font-size:14px;">${numberOfPeople} ${numberOfPeople === 1 ? 'person' : 'people'}</td></tr>
            ${departureCity ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Departure</td><td style="padding:6px 0;color:#1f2937;font-size:14px;">${departureCity} via ${transportMode}</td></tr>` : ''}
          </table>
        </div>

        <!-- Price Breakdown -->
        <div style="background:#f9fafb;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #e5e7eb;">
          <h3 style="margin:0;padding:16px 20px;color:#1f2937;font-size:16px;border-bottom:1px solid #e5e7eb;">💰 Price Breakdown</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 12px;color:#374151;">Package (${numberOfPeople} × ₹${(packageAmount / numberOfPeople).toLocaleString('en-IN')})</td>
              <td style="padding:8px 12px;color:#374151;text-align:right;">₹${packageAmount.toLocaleString('en-IN')}</td>
            </tr>
            ${transportRow}
            ${discountRow}
            <tr style="border-top:2px solid #e5e7eb;">
              <td style="padding:12px;color:#1f2937;font-weight:bold;font-size:16px;">Total Paid</td>
              <td style="padding:12px;color:#2563eb;font-weight:bold;font-size:18px;text-align:right;">₹${totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        ${discountAmount > 0 ? `
        <!-- Discount Badge -->
        <div style="background:#dcfce7;border:1px solid #bbf7d0;border-radius:10px;padding:14px 20px;margin-bottom:24px;text-align:center;">
          <p style="margin:0;color:#15803d;font-weight:bold;font-size:14px;">🎉 You saved ₹${discountAmount.toLocaleString('en-IN')} with our Group Discount!</p>
        </div>` : ''}

        <!-- Important Notice -->
        <div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:18px 20px;margin-bottom:24px;">
          <h3 style="margin:0 0 12px;color:#1e40af;font-size:15px;font-weight:bold;">📋 Important — Please Carry These</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:5px 0;color:#1e40af;font-size:14px;vertical-align:top;width:24px;">✅</td>
              <td style="padding:5px 0;color:#1e3a8a;font-size:13px;"><strong>This booking confirmation email</strong> (printed or on your phone)</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#1e40af;font-size:14px;vertical-align:top;">✅</td>
              <td style="padding:5px 0;color:#1e3a8a;font-size:13px;"><strong>Valid Government-issued Photo ID</strong> — Aadhaar Card, Passport, Voter ID, or Driving Licence</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#1e40af;font-size:14px;vertical-align:top;">✅</td>
              <td style="padding:5px 0;color:#1e3a8a;font-size:13px;"><strong>Booking ID: ${bookingId.slice(-8).toUpperCase()}</strong> — for quick verification at check-in</td>
            </tr>
            <tr>
              <td style="padding:5px 0;color:#1e40af;font-size:14px;vertical-align:top;">ℹ️</td>
              <td style="padding:5px 0;color:#1e3a8a;font-size:13px;">All travellers must carry their own valid ID. IDs will be verified at hotel check-in and during sightseeing activities.</td>
            </tr>
          </table>
        </div>

        <!-- Cancellation Policy -->
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <h3 style="margin:0 0 8px;color:#c2410c;font-size:14px;">⚠️ Cancellation Policy</h3>
          <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6;">${cancellationPolicy}</p>
        </div>

        <!-- Support -->
        <p style="color:#6b7280;font-size:13px;text-align:center;margin:0;">
          Questions? Contact us at <a href="mailto:mjv3140@gmail.com" style="color:#2563eb;">mjv3140@gmail.com</a>
        </p>
        <p style="color:#10b981;font-size:14px;text-align:center;margin:12px 0 0;font-weight:600;">
          🌟 Have a wonderful and safe journey! Enjoy every moment of your trip! ✈️
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 TripEase · Secure payments by Razorpay</p>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'TripEase <noreply@tripease.com>',
    to: userEmail,
    subject: `✅ Booking Confirmed — ${packageName} | TripEase`,
    html,
  });
};
