import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { id } = await params;
    const body = await request.json();
    
    console.log(`Updating coupon ${id} with:`, body);
    
    // Convert string values to proper types
    const updateData: any = { ...body };
    if (updateData.discountValue !== undefined) {
      updateData.discountValue = parseFloat(updateData.discountValue);
    }
    if (updateData.minBookingAmount !== undefined) {
      updateData.minBookingAmount = parseFloat(updateData.minBookingAmount);
    }
    if (updateData.maxUses !== undefined) {
      updateData.maxUses = parseInt(updateData.maxUses);
    }
    if (updateData.expiresAt !== undefined) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }
    
    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });
    
    console.log(`Coupon ${id} updated. New active status:`, coupon.active);
    
    return successResponse(coupon, 'Coupon updated');
  } catch (err) {
    console.error('Coupon update error:', err);
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to update coupon', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });
    return successResponse(null, 'Coupon deleted');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to delete coupon', 500);
  }
}
