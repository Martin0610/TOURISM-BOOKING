import { Request, Response } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { packageId, departureLocationId, travelDate, numberOfPeople } = req.body;

    if (!packageId || !travelDate || !numberOfPeople) {
      errorResponse(res, 'packageId, travelDate and numberOfPeople are required', 400);
      return;
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) { errorResponse(res, 'Package not found', 404); return; }

    if (pkg.availableSeats < numberOfPeople) {
      errorResponse(res, `Only ${pkg.availableSeats} seats available`, 400);
      return;
    }

    // Backend calculates all amounts — never trust frontend
    const packageAmount = pkg.pricePerPerson * numberOfPeople;
    let transportAmount = 0;

    if (departureLocationId) {
      const dep = await prisma.departureLocation.findUnique({ where: { id: departureLocationId } });
      if (!dep) { errorResponse(res, 'Departure location not found', 404); return; }
      if (!dep.available) { errorResponse(res, 'Selected departure route is not available', 400); return; }
      transportAmount = dep.transportPrice * numberOfPeople;
    }

    const totalAmount = packageAmount + transportAmount;

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        packageId,
        departureLocationId: departureLocationId || null,
        travelDate: new Date(travelDate),
        numberOfPeople: parseInt(numberOfPeople),
        packageAmount,
        transportAmount,
        totalAmount,
        status: 'PENDING',
      },
      include: {
        package: true,
        departureLocation: true,
      },
    });

    // Decrement seats
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
      include: {
        package: true,
        departureLocation: true,
        payment: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    successResponse(res, bookings);
  } catch {
    errorResponse(res, 'Failed to fetch bookings', 500);
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        package: true,
        departureLocation: true,
        payment: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) { errorResponse(res, 'Booking not found', 404); return; }
    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      errorResponse(res, 'Access denied', 403); return;
    }

    successResponse(res, booking);
  } catch {
    errorResponse(res, 'Failed to fetch booking', 500);
  }
};

export const updateBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) { errorResponse(res, 'Booking not found', 404); return; }
    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      errorResponse(res, 'Access denied', 403); return;
    }

    const { status } = req.body;
    const updated = await prisma.booking.update({
      where: { id },
      data: { ...(status && { status }) },
      include: { package: true, departureLocation: true },
    });

    successResponse(res, updated, 'Booking updated');
  } catch {
    errorResponse(res, 'Failed to update booking', 500);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) { errorResponse(res, 'Booking not found', 404); return; }
    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      errorResponse(res, 'Access denied', 403); return;
    }
    if (booking.status === 'CANCELLED') {
      errorResponse(res, 'Booking already cancelled', 400); return;
    }

    await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
    // Restore seats only if payment wasn't successful
    await prisma.package.update({
      where: { id: booking.packageId },
      data: { availableSeats: { increment: booking.numberOfPeople } },
    });

    successResponse(res, null, 'Booking cancelled');
  } catch {
    errorResponse(res, 'Failed to cancel booking', 500);
  }
};
