import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { code, bookingAmount } = await request.json();
    if (!code || !bookingAmount) {
      return errorResponse('code and bookingAmount are required', 400);
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return errorResponse('Invalid coupon code', 404);
    }
    if (!coupon.active) {
      return errorResponse('This coupon is no longer active', 400);
    }
    if (new Date() > coupon.expiresAt) {
      return errorResponse('Coupon has expired', 400);
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return errorResponse('Coupon usage limit reached', 400);
    }
    if (bookingAmount < coupon.minBookingAmount) {
      return errorResponse(`Minimum booking amount is ₹${coupon.minBookingAmount.toLocaleString('en-IN')}`, 400);
    }

    const discountAmount = coupon.discountType === 'PERCENTAGE'
      ? Math.round(bookingAmount * (coupon.discountValue / 100))
      : Math.min(coupon.discountValue, bookingAmount);

    return successResponse({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    }, 'Coupon applied successfully');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to validate coupon', 500);
  }
}
