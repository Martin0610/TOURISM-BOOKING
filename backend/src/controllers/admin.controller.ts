import { Request, Response } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalPackages, totalUsers, totalBookings, confirmedBookings, pendingBookings, cancelledBookings, revenueResult, recentBookings, topPackages] =
      await Promise.all([
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

    // Get package names for top packages
    const packageIds = topPackages.map((p) => p.packageId);
    const packages = await prisma.package.findMany({
      where: { id: { in: packageIds } },
      select: { id: true, name: true, destination: true, imageUrl: true },
    });

    const topPackagesWithNames = topPackages.map((tp) => ({
      ...tp,
      package: packages.find((p) => p.id === tp.packageId),
    }));

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentPayments = await prisma.payment.findMany({
      where: { status: 'SUCCESS', createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    });

    // Group by month
    const monthlyRevenue: Record<string, number> = {};
    recentPayments.forEach((p) => {
      const month = p.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
    });

    successResponse(res, {
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
    console.error(err);
    errorResponse(res, 'Failed to fetch stats', 500);
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, phone: true, role: true, createdAt: true,
        bookings: {
          select: { id: true, status: true, totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    successResponse(res, users);
  } catch {
    errorResponse(res, 'Failed to fetch users', 500);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, role: true, createdAt: true,
        bookings: { include: { package: true, payment: true } },
      },
    });
    if (!user) { errorResponse(res, 'User not found', 404); return; }
    successResponse(res, user);
  } catch {
    errorResponse(res, 'Failed to fetch user', 500);
  }
};

export const getAllPayments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            package: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    successResponse(res, payments);
  } catch {
    errorResponse(res, 'Failed to fetch payments', 500);
  }
};

export const getRevenueStats = async (_req: Request, res: Response): Promise<void> => {
  try {
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

    successResponse(res, Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue })));
  } catch {
    errorResponse(res, 'Failed to fetch revenue stats', 500);
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) { errorResponse(res, 'Invalid role', 400); return; }
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    successResponse(res, user, 'User role updated');
  } catch {
    errorResponse(res, 'Failed to update user role', 500);
  }
};
