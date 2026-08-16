import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { packageId } = await params;
    const existing = await prisma.wishlist.findUnique({
      where: { userId_packageId: { userId: authUser!.id, packageId } },
    });
    
    if (!existing) {
      return errorResponse('Package not in wishlist', 404);
    }

    await prisma.wishlist.delete({
      where: { userId_packageId: { userId: authUser!.id, packageId } },
    });
    
    return successResponse(null, 'Removed from wishlist');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to remove from wishlist', 500);
  }
}
