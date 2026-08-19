import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const [subscribers, announcements] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vipAnnouncement.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse({
      subscribers,
      announcements,
      totalSubscribers: subscribers.length,
      activeSubscribers: subscribers.filter((s) => s.active).length,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to fetch VIP data', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { title, message, couponCode, discount } = await request.json();

    if (!title || !message) {
      return errorResponse('Title and message are required', 400);
    }

    const announcement = await prisma.vipAnnouncement.create({
      data: {
        title,
        message,
        couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
        discount: discount ? discount.trim() : null,
        active: true,
      },
    });

    return successResponse(announcement, 'VIP Announcement published successfully', 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to publish announcement', 500);
  }
}
