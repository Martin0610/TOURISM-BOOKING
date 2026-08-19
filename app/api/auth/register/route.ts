import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { sendVerificationOTP } from '@/lib/email.service';
import { validateEmailServer } from '@/lib/email-validation';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();
    
    if (!name || !email || !password) {
      return errorResponse('Name, email and password are required', 400);
    }

    // Validate email format, domain, and check for disposable emails
    const emailValidation = await validateEmailServer(email.toLowerCase());
    if (!emailValidation.isValid) {
      return errorResponse(emailValidation.error || 'Invalid email address', 400);
    }

    const existing = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existing) {
      return errorResponse('Email already registered', 409);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { 
        name, 
        email: email.toLowerCase(), 
        password: hashedPassword, 
        phone,
        emailVerified: false,
        verificationOtp: otp,
        verificationOtpExpiry: otpExpiry,
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        phone: true,
        role: true, 
        emailVerified: true,
        createdAt: true 
      },
    });

    // Send verification OTP via email
    await sendVerificationOTP(email, otp, name);

    return successResponse(
      { user, requiresVerification: true }, 
      'Registration successful. Please check your email for verification OTP.', 
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Registration failed', 500);
  }
}
