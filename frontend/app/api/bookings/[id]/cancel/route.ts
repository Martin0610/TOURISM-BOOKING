import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { id } = await params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return errorResponse('Booking not found', 404);
    }
    
    if (booking.userId !== authUser!.id && authUser!.role !== 'ADMIN') {
      return errorResponse('Access denied', 403);
    }
    
    if (booking.status === 'CANCELLED') {
      return errorResponse('Booking already cancelled', 400);
    }

    await prisma.booking.update({ 
      where: { id }, 
      data: { status: 'CANCELLED' } 
    });
    
    await prisma.package.update({
      where: { id: booking.packageId },
      data: { availableSeats: { increment: booking.numberOfPeople } },
    });

    return successResponse(null, 'Booking cancelled');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to cancel booking', 500);
  }
}
