import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    return NextResponse.json({ 
      message: 'Password reset successfully',
      success: true 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Failed to reset password' }, { status: 500 });
  }
}
