import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [pendingBookings, pendingVip, pendingReviews, recentReviews] = await Promise.all([
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.newsletterSubscriber.count({ where: { status: 'PENDING', active: true } }),
      prisma.review.count({ where: { approved: false } }),
      prisma.review.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

    const reviewBadgeCount = pendingReviews > 0 ? pendingReviews : recentReviews;

    return successResponse({
      bookings: pendingBookings,
      vip: pendingVip,
      reviews: reviewBadgeCount,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse('Failed to fetch notifications', 500);
  }
}
