import { Request, Response } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { packageId, travelDate, numberOfPeople } = req.body;
    if (!packageId || !travelDate || !numberOfPeople) {
      errorResponse(res, 'packageId, travelDate and numberOfPeople are required', 400);
      return;
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      errorResponse(res, 'Package not found', 404);
      return;
    }

    if (pkg.availableSeats < numberOfPeople) {
      errorResponse(res, `Only ${pkg.availableSeats} seats available`, 400);
      return;
    }

    // Calculate total on backend - never trust frontend price
    const totalAmount = pkg.price * numberOfPeople;

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        packageId,
        travelDate: new Date(travelDate),
        numberOfPeople: parseInt(numberOfPeople),
        totalAmount,
        status: 'PENDING',
      },
      include: { package: true },
    });

    // Decrease available seats
    await prisma.package.update({
      where: { id: packageId },
      data: { availableSeats: { decrement: parseInt(numberOfPeople) } },
    });

    successResponse(res, booking, 'Booking created', 201);
  } catch {
    errorResponse(res, 'Failed to create booking', 500);
  }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const bookings = await prisma.booking.findMany({
      where: isAdmin ? {} : { userId: req.user!.id },
      include: { package: true, payment: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    successResponse(res, bookings);
  } catch {
    errorResponse(res, 'Failed to fetch bookings', 500);
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { package: true, payment: true, user: { select: { id: true, name: true, email: true } } },
    });

    if (!booking) {
      errorResponse(res, 'Booking not found', 404);
      return;
    }

    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      errorResponse(res, 'Access denied', 403);
      return;
    }

    successResponse(res, booking);
  } catch {
    errorResponse(res, 'Failed to fetch booking', 500);
  }
};

export const updateBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) {
      errorResponse(res, 'Booking not found', 404);
      return;
    }

    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      errorResponse(res, 'Access denied', 403);
      return;
    }

    const { status } = req.body;
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { ...(status && { status }) },
      include: { package: true },
    });

    successResponse(res, updated, 'Booking updated');
  } catch {
    errorResponse(res, 'Failed to update booking', 500);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) {
      errorResponse(res, 'Booking not found', 404);
      return;
    }

    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      errorResponse(res, 'Access denied', 403);
      return;
    }

    if (booking.status === 'CANCELLED') {
      errorResponse(res, 'Booking already cancelled', 400);
      return;
    }

    await prisma.booking.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });

    // Restore seats on cancellation
    await prisma.package.update({
      where: { id: booking.packageId },
      data: { availableSeats: { increment: booking.numberOfPeople } },
    });

    successResponse(res, null, 'Booking cancelled');
  } catch {
    errorResponse(res, 'Failed to cancel booking', 500);
  }
};
