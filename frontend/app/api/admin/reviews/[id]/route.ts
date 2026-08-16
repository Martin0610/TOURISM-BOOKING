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
    const { approved } = await request.json();
    const review = await prisma.review.update({
      where: { id },
      data: { approved: Boolean(approved) },
    });
    
    return successResponse(review, `Review ${approved ? 'approved' : 'rejected'}`);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to moderate review', 500);
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
    await prisma.review.delete({ where: { id } });
    return successResponse(null, 'Review deleted');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to delete review', 500);
  }
}
