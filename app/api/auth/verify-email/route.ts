import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 400 });
    }

    if (!user.verificationOtp || !user.verificationOtpExpiry) {
      return NextResponse.json({ message: 'No verification request found' }, { status: 400 });
    }

    if (new Date() > user.verificationOtpExpiry) {
      return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
    }

    if (user.verificationOtp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    // Mark email as verified and clear OTP
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        emailVerified: true,
        verificationOtp: null,
        verificationOtpExpiry: null,
      },
    });

    return NextResponse.json({ 
      message: 'Email verified successfully! You can now login.',
      success: true 
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ message: 'Failed to verify email' }, { status: 500 });
  }
}
