import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const byMonth: Record<string, number> = {};
    payments.forEach((p) => {
      const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + p.amount;
    });

    return successResponse(
      Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue }))
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to fetch revenue stats', 500);
  }
}
