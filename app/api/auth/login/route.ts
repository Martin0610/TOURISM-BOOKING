import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { generateToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!user) {
      return errorResponse('No account found with this email address', 401);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return errorResponse('Please verify your email before logging in. Check your inbox for the verification OTP.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse('Incorrect password. Please try again', 401);
    }

    const token = generateToken({ id: user.id, role: user.role });
    return successResponse({
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token,
    }, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(`Login failed: ${err instanceof Error ? err.message : String(err)}`, 500);
  }
}
