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

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return NextResponse.json({ message: 'No OTP request found' }, { status: 400 });
    }

    if (new Date() > user.resetOtpExpiry) {
      return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
    }

    if (user.resetOtp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'OTP verified successfully',
      success: true 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ message: 'Failed to verify OTP' }, { status: 500 });
  }
}
