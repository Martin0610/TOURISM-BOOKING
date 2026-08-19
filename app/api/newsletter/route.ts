import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (!existing.active) {
        await prisma.newsletterSubscriber.update({
          where: { email: cleanEmail },
          data: { active: true },
        });
        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your VIP subscription has been reactivated 🎉',
        });
      }
      return NextResponse.json({
        success: true,
        message: "You're already on our VIP secret deals list! 🌟",
      });
    }

    await prisma.newsletterSubscriber.create({
      data: { email: cleanEmail, active: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Welcome to the VIP Travel Club! Exclusive deals will arrive in your inbox 🎁',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Subscription failed.' },
      { status: 500 }
    );
  }
}
