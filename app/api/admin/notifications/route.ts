import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { searchParams } = new URL(request.url);
    const sinceBookings = searchParams.get('sinceBookings');
    const sinceVip = searchParams.get('sinceVip');
    const sinceReviews = searchParams.get('sinceReviews');

    const bookingsWhere: any = { status: 'PENDING' };
    if (sinceBookings && !isNaN(Number(sinceBookings))) {
      bookingsWhere.createdAt = { gt: new Date(Number(sinceBookings)) };
    }

    const vipWhere: any = { status: 'PENDING', active: true };
    if (sinceVip && !isNaN(Number(sinceVip))) {
      vipWhere.createdAt = { gt: new Date(Number(sinceVip)) };
    }

    const reviewsWhere: any = { approved: false };
    if (sinceReviews && !isNaN(Number(sinceReviews))) {
      reviewsWhere.createdAt = { gt: new Date(Number(sinceReviews)) };
    }

    const [pendingBookings, pendingVip, pendingReviews] = await Promise.all([
      prisma.booking.count({ where: bookingsWhere }),
      prisma.newsletterSubscriber.count({ where: vipWhere }),
      prisma.review.count({ where: reviewsWhere }),
    ]);

    return successResponse({
      bookings: pendingBookings,
      vip: pendingVip,
      reviews: pendingReviews,
    });
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse('Failed to fetch notifications', 500);
  }
}
