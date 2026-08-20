import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        package: true,
        departureLocation: true,
        payment: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }
    
    if (booking.userId !== authUser!.id && authUser!.role !== 'ADMIN') {
      return errorResponse('Access denied', 403);
    }

    return successResponse(booking);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to fetch booking', 500);
  }
}

export async function PUT(
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

    const { status } = await request.json();

    if (status === 'CANCELLED' && booking.status !== 'CANCELLED') {
      // Restore seats
      await prisma.package.update({
        where: { id: booking.packageId },
        data: { availableSeats: { increment: booking.numberOfPeople } },
      });
    } else if (status === 'CONFIRMED' && booking.status === 'CANCELLED') {
      // Decrement seats
      await prisma.package.update({
        where: { id: booking.packageId },
        data: { availableSeats: { decrement: booking.numberOfPeople } },
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { ...(status && { status }) },
      include: { package: true, departureLocation: true },
    });

    return successResponse(updated, `Booking status updated to ${status}`);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to update booking', 500);
  }
}
