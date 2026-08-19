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

    // Check if registered user exists
    const registeredUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    const confirmedBookingsCount = registeredUser?.bookings.length || 0;

    // Check existing VIP application
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (existing.status === 'APPROVED') {
        return NextResponse.json({
          success: true,
          message: '🌟 You are already an Approved VIP Member! Enjoy your exclusive discounts.',
        });
      }

      if (existing.status === 'PENDING') {
        return NextResponse.json({
          success: true,
          message: '⏳ Your VIP application is under admin review. We will notify you once approved!',
        });
      }

      // If was REJECTED, allow re-application
      await prisma.newsletterSubscriber.update({
        where: { email: cleanEmail },
        data: { status: 'PENDING', reviewedAt: null },
      });

      return NextResponse.json({
        success: true,
        message: 'VIP Application re-submitted for review! Our admin will check your travel history.',
      });
    }

    // Create new PENDING application
    await prisma.newsletterSubscriber.create({
      data: {
        email: cleanEmail,
        status: 'PENDING',
        active: true,
      },
    });

    const bonusMsg = confirmedBookingsCount > 0
      ? ` (Found ${confirmedBookingsCount} confirmed bookings in your account!)`
      : '';

    return NextResponse.json({
      success: true,
      message: `VIP Application received!${bonusMsg} Our admin will review your travel history and approve your VIP status.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Application failed.' },
      { status: 500 }
    );
  }
}
