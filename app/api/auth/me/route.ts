import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const user = await prisma.user.findUnique({
      where: { id: authUser!.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        role: true, 
        createdAt: true,
        bookings: {
          select: { id: true, status: true, totalAmount: true }
        }
      },
    });
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: user.email.toLowerCase().trim() },
    });

    const confirmedBookings = user.bookings.filter(b => b.status === 'CONFIRMED');
    const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const vipStatus = subscriber ? subscriber.status : 'NOT_APPLIED';
    const isVip = subscriber?.status === 'APPROVED';

    return successResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      totalBookings: user.bookings.length,
      confirmedBookings: confirmedBookings.length,
      totalSpent,
      vipStatus,
      isVip,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to get user', 500);
  }
}
