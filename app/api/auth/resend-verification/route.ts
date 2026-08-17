import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendVerificationOTP } from '@/lib/email.service';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 400 });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        verificationOtp: otp,
        verificationOtpExpiry: otpExpiry,
      },
    });

    await sendVerificationOTP(email, otp, user.name);

    return NextResponse.json({ 
      message: 'New OTP sent to your email',
      success: true 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ message: 'Failed to resend OTP' }, { status: 500 });
  }
}
