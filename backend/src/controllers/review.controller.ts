import { Response } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { packageId, bookingId, rating, comment } = req.body;
    if (!packageId || !bookingId || !rating) {
      errorResponse(res, 'packageId, bookingId and rating are required', 400);
      return;
    }
    if (rating < 1 || rating > 5) {
      errorResponse(res, 'Rating must be between 1 and 5', 400);
      return;
    }

    // Verify user completed this booking
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.userId !== req.user!.id) {
      errorResponse(res, 'You can only review packages you have booked', 403);
      return;
    }
    if (booking.status !== 'CONFIRMED') {
      errorResponse(res, 'You can only review after booking is confirmed', 400);
      return;
    }

    const existing = await prisma.review.findUnique({ where: { bookingId } });
    if (existing) {
      errorResponse(res, 'You have already reviewed this booking', 409);
      return;
    }

    const review = await prisma.review.create({
      data: { userId: req.user!.id, packageId, bookingId, rating: parseInt(rating), comment, approved: false },
      include: { user: { select: { name: true } } },
    });

    successResponse(res, review, 'Review submitted and pending approval', 201);
  } catch {
    errorResponse(res, 'Failed to submit review', 500);
  }
};

export const getPackageReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { packageId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { packageId, approved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    successResponse(res, { reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
  } catch {
    errorResponse(res, 'Failed to fetch reviews', 500);
  }
};

export const getAllReviewsAdmin = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        package: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    successResponse(res, reviews);
  } catch {
    errorResponse(res, 'Failed to fetch reviews', 500);
  }
};

export const moderateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { approved } = req.body;
    const review = await prisma.review.update({
      where: { id },
      data: { approved: Boolean(approved) },
    });
    successResponse(res, review, `Review ${approved ? 'approved' : 'rejected'}`);
  } catch {
    errorResponse(res, 'Failed to moderate review', 500);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.review.delete({ where: { id } });
    successResponse(res, null, 'Review deleted');
  } catch {
    errorResponse(res, 'Failed to delete review', 500);
  }
};
