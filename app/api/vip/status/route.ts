import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return successResponse({
        isLoggedIn: false,
        isVip: false,
        status: 'NOT_LOGGED_IN',
        totalSpent: 0,
        targetSpend: 60000,
        spendProgress: 0,
        confirmedBookingsCount: 0,
        announcements: [],
      });
    }

    // Look up registered user by id
    const userWithBookings = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { totalAmount: true, id: true, travelDate: true },
        },
      },
    });

    if (!userWithBookings) {
      return successResponse({
        isLoggedIn: false,
        isVip: false,
        status: 'NOT_LOGGED_IN',
        totalSpent: 0,
        targetSpend: 60000,
        spendProgress: 0,
        confirmedBookingsCount: 0,
        announcements: [],
      });
    }

    const email = userWithBookings.email.toLowerCase().trim();

    const [subscriber, announcements] = await Promise.all([
      prisma.newsletterSubscriber.findUnique({
        where: { email },
      }),
      prisma.vipAnnouncement.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const confirmedBookings = userWithBookings.bookings || [];
    const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const TARGET_SPEND = 60000;
    const spendProgress = Math.min(100, Math.round((totalSpent / TARGET_SPEND) * 100));

    const status = subscriber ? subscriber.status : 'NOT_APPLIED';
    const isVip = subscriber?.status === 'APPROVED';

    return successResponse({
      isLoggedIn: true,
      userName: userWithBookings.name,
      userEmail: email,
      isVip,
      status,
      active: subscriber?.active ?? false,
      reviewedAt: subscriber?.reviewedAt || null,
      totalSpent,
      targetSpend: TARGET_SPEND,
      spendProgress,
      confirmedBookingsCount: confirmedBookings.length,
      announcements: isVip ? announcements : announcements.slice(0, 1),
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch VIP status', 500);
  }
}
