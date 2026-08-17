import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendPasswordResetOTP } from '@/lib/email.service';
import { validateEmailServer } from '@/lib/email-validation';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Validate email format and domain
    const emailValidation = await validateEmailServer(email.toLowerCase());
    if (!emailValidation.isValid) {
      return NextResponse.json({ message: emailValidation.error || 'Invalid email address' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        resetOtp: otp,
        resetOtpExpiry: otpExpiry,
      },
    });

    await sendPasswordResetOTP(email, otp, user.name);

    return NextResponse.json({ 
      message: 'OTP sent to your email',
      success: true 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 });
  }
}
