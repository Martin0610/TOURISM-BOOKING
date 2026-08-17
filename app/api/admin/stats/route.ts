import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const [
      totalPackages, totalUsers, totalBookings, confirmedBookings, pendingBookings, 
      cancelledBookings, revenueResult, recentBookings, topPackages
    ] = await Promise.all([
      prisma.package.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          package: { select: { name: true, destination: true } },
        },
      }),
      prisma.booking.groupBy({
        by: ['packageId'],
        _count: { packageId: true },
        _sum: { totalAmount: true },
        orderBy: { _count: { packageId: 'desc' } },
        take: 5,
      }),
    ]);

    const packageIds = topPackages.map((p) => p.packageId);
    const packages = await prisma.package.findMany({
      where: { id: { in: packageIds } },
      select: { id: true, name: true, destination: true, imageUrl: true },
    });

    const topPackagesWithNames = topPackages.map((tp) => ({
      ...tp,
      package: packages.find((p) => p.id === tp.packageId),
    }));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentPayments = await prisma.payment.findMany({
      where: { status: 'SUCCESS', createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    recentPayments.forEach((p) => {
      const month = p.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
    });

    return successResponse({
      totalPackages,
      totalUsers,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue: revenueResult._sum.amount ?? 0,
      recentBookings,
      topPackages: topPackagesWithNames,
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to fetch stats', 500);
  }
}
