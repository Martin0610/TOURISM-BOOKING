import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, phone: true, role: true, createdAt: true,
        bookings: { select: { id: true, status: true, totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return successResponse(users);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to fetch users', 500);
  }
}
