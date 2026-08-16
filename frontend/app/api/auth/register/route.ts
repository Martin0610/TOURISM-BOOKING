import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { generateToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();
    
    if (!name || !email || !password) {
      return errorResponse('Name, email and password are required', 400);
    }

    const existing = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existing) {
      return errorResponse('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { 
        name, 
        email: email.toLowerCase(), 
        password: hashedPassword, 
        phone 
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        createdAt: true 
      },
    });

    const token = generateToken({ id: user.id, role: user.role });
    return successResponse({ user, token }, 'Registration successful', 201);
  } catch {
    return errorResponse('Registration failed', 500);
  }
}
