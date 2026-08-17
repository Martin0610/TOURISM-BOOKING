import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        minBookingAmount: true,
        expiresAt: true,
        maxUses: true,
        usedCount: true,
      },
      orderBy: { discountValue: 'desc' },
    });

    const available = coupons.filter(c => c.usedCount < c.maxUses);
    return successResponse(available);
  } catch {
    return errorResponse('Failed to fetch coupons', 500);
  }
}
