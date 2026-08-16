import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const coupons = await prisma.coupon.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    
    return successResponse(coupons);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to fetch coupons', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { code, discountType, discountValue, minBookingAmount, maxUses, expiresAt } = await request.json();
    
    if (!code || !discountType || !discountValue || !expiresAt) {
      return errorResponse('code, discountType, discountValue and expiresAt are required', 400);
    }

    const existing = await prisma.coupon.findUnique({ 
      where: { code: code.toUpperCase() } 
    });
    if (existing) {
      return errorResponse('Coupon code already exists', 409);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minBookingAmount: parseFloat(minBookingAmount || 0),
        maxUses: parseInt(maxUses || 100),
        expiresAt: new Date(expiresAt),
      },
    });
    
    return successResponse(coupon, 'Coupon created', 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to create coupon', 500);
  }
}
