import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Delete all users except mjv3140@gmail.com
    await prisma.user.deleteMany({
      where: {
        email: {
          not: 'mjv3140@gmail.com'
        }
      }
    });

    // Check if mjv3140@gmail.com exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'mjv3140@gmail.com' }
    });

    if (existingUser) {
      // Update to admin with new password
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await prisma.user.update({
        where: { email: 'mjv3140@gmail.com' },
        data: { 
          role: 'ADMIN',
          emailVerified: true,
          password: hashedPassword
        }
      });
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await prisma.user.create({
        data: {
          name: 'Martin Admin',
          email: 'mjv3140@gmail.com',
          password: hashedPassword,
          phone: '7200336447',
          role: 'ADMIN',
          emailVerified: true
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Users reset! mjv3140@gmail.com is now the only admin. Password: Admin@123'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
