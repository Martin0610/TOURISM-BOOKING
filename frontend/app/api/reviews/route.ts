import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { packageId, bookingId, rating, comment } = await request.json();
    
    if (!packageId || !bookingId || !rating) {
      return errorResponse('packageId, bookingId and rating are required', 400);
    }
    if (rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.userId !== authUser!.id) {
      return errorResponse('You can only review packages you have booked', 403);
    }
    if (booking.status !== 'CONFIRMED') {
      return errorResponse('You can only review after booking is confirmed', 400);
    }

    const existing = await prisma.review.findUnique({ where: { bookingId } });
    if (existing) {
      return errorResponse('You have already reviewed this booking', 409);
    }

    const review = await prisma.review.create({
      data: { 
        userId: authUser!.id, 
        packageId, 
        bookingId, 
        rating: parseInt(rating), 
        comment, 
        approved: true
      },
      include: { user: { select: { name: true } } },
    });

    return successResponse(review, 'Thanks for your feedback!', 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to submit review', 500);
  }
}
