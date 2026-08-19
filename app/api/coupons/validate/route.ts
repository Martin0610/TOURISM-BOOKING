import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(await getAuthUser(request));

    const { code, bookingAmount } = await request.json();
    if (!code || !bookingAmount) {
      return errorResponse('code and bookingAmount are required', 400);
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

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

    // VIP Exclusivity Check
    const isVipCode = coupon.code.toUpperCase().startsWith('VIP');
    const isVipAnnouncement = await prisma.vipAnnouncement.findFirst({
      where: { couponCode: coupon.code, active: true },
    });

    if (isVipCode || isVipAnnouncement) {
      const userRecord = await prisma.user.findUnique({ where: { id: authUser.id } });
      const userEmail = userRecord?.email?.toLowerCase() || '';

      const isApprovedVip = await prisma.newsletterSubscriber.findFirst({
        where: {
          email: userEmail,
          status: 'APPROVED',
          active: true,
        },
      });

      if (!isApprovedVip && authUser.role !== 'ADMIN') {
        return errorResponse(
          'This exclusive promo code is reserved for TripEase VIP Elite Members. Apply or check your membership status at /vip.',
          403
        );
      }
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
