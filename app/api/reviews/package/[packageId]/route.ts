import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const { packageId } = await params;
    const reviews = await prisma.review.findMany({
      where: { packageId },  // Show all reviews (no approval filter)
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0;

    return successResponse({ 
      reviews, 
      avgRating: Math.round(avgRating * 10) / 10, 
      total: reviews.length 
    });
  } catch {
    return errorResponse('Failed to fetch reviews', 500);
  }
}
