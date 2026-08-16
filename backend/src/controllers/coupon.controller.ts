import { Request, Response } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, bookingAmount } = req.body;
    if (!code || !bookingAmount) {
      errorResponse(res, 'code and bookingAmount are required', 400);
      return;
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) { errorResponse(res, 'Invalid coupon code', 404); return; }
    if (!coupon.active) { errorResponse(res, 'This coupon is no longer active', 400); return; }
    if (new Date() > coupon.expiresAt) { errorResponse(res, 'Coupon has expired', 400); return; }
    if (coupon.usedCount >= coupon.maxUses) { errorResponse(res, 'Coupon usage limit reached', 400); return; }
    if (bookingAmount < coupon.minBookingAmount) {
      errorResponse(res, `Minimum booking amount is ₹${coupon.minBookingAmount.toLocaleString('en-IN')}`, 400);
      return;
    }

    const discountAmount = coupon.discountType === 'PERCENTAGE'
      ? Math.round(bookingAmount * (coupon.discountValue / 100))
      : Math.min(coupon.discountValue, bookingAmount);

    successResponse(res, {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    }, 'Coupon applied successfully');
  } catch {
    errorResponse(res, 'Failed to validate coupon', 500);
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, minBookingAmount, maxUses, expiresAt } = req.body;
    if (!code || !discountType || !discountValue || !expiresAt) {
      errorResponse(res, 'code, discountType, discountValue and expiresAt are required', 400);
      return;
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) { errorResponse(res, 'Coupon code already exists', 409); return; }

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
    successResponse(res, coupon, 'Coupon created', 201);
  } catch {
    errorResponse(res, 'Failed to create coupon', 500);
  }
};

export const getAllCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    successResponse(res, coupons);
  } catch {
    errorResponse(res, 'Failed to fetch coupons', 500);
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const coupon = await prisma.coupon.update({
      where: { id },
      data: req.body,
    });
    successResponse(res, coupon, 'Coupon updated');
  } catch {
    errorResponse(res, 'Failed to update coupon', 500);
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.coupon.delete({ where: { id } });
    successResponse(res, null, 'Coupon deleted');
  } catch {
    errorResponse(res, 'Failed to delete coupon', 500);
  }
};
