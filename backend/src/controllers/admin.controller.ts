import { Request, Response } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalPackages, totalUsers, totalBookings, confirmedBookings, pendingBookings, revenueResult] =
      await Promise.all([
        prisma.package.count(),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'CONFIRMED' } }),
        prisma.booking.count({ where: { status: 'PENDING' } }),
        prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      ]);

    successResponse(res, {
      totalPackages,
      totalUsers,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalRevenue: revenueResult._sum.amount ?? 0,
    });
  } catch {
    errorResponse(res, 'Failed to fetch stats', 500);
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, bookings: { select: { id: true, status: true } } },
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
    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }
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
