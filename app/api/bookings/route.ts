import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

// Group discount calculation
const calculateDiscount = (pricePerPerson: number, numberOfPeople: number) => {
  const freeTickets = Math.floor(numberOfPeople / 4);
  if (freeTickets > 0) {
    const paidPeople = numberOfPeople - freeTickets;
    const packageAmount = pricePerPerson * paidPeople;
    return { discountAmount: pricePerPerson * freeTickets, packageAmount };
  }
  const packageAmount = pricePerPerson * numberOfPeople;
  if (numberOfPeople >= 3) {
    return { discountAmount: Math.round(packageAmount * 0.20), packageAmount };
  }
  return { discountAmount: 0, packageAmount };
};

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const isAdmin = authUser!.role === 'ADMIN';
    const bookings = await prisma.booking.findMany({
      where: isAdmin ? {} : { userId: authUser!.id },
      include: {
        package: true,
        departureLocation: true,
        payment: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return successResponse(bookings);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to fetch bookings', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { packageId, departureLocationId, travelDate, numberOfPeople, couponCode, phone } = await request.json();

    if (!packageId || !travelDate || !numberOfPeople) {
      return errorResponse('packageId, travelDate and numberOfPeople are required', 400);
    }

    if (phone) {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return errorResponse('Please provide a valid phone number', 400);
      }
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return errorResponse('Package not found', 404);
    }

    if (pkg.availableSeats < numberOfPeople) {
      return errorResponse(`Only ${pkg.availableSeats} seats available`, 400);
    }

    const { discountAmount, packageAmount } = calculateDiscount(pkg.pricePerPerson, numberOfPeople);
    let transportAmount = 0;
    let couponDiscount = 0;
    let couponId = null;

    if (departureLocationId) {
      const dep = await prisma.departureLocation.findUnique({ where: { id: departureLocationId } });
      if (!dep) {
        return errorResponse('Departure location not found', 404);
      }
      if (!dep.available) {
        return errorResponse('Selected departure route is not available', 400);
      }
      transportAmount = dep.transportPrice * numberOfPeople;
    }

    // Apply coupon
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.active && new Date() <= coupon.expiresAt && coupon.usedCount < coupon.maxUses) {
        const subtotal = packageAmount + transportAmount - discountAmount;
        if (subtotal >= coupon.minBookingAmount) {
          couponDiscount = coupon.discountType === 'PERCENTAGE'
            ? Math.round(subtotal * (coupon.discountValue / 100))
            : Math.min(coupon.discountValue, subtotal);
          couponId = coupon.id;
          await prisma.coupon.update({ 
            where: { id: coupon.id }, 
            data: { usedCount: { increment: 1 } } 
          });
        }
      }
    }

    const totalAmount = packageAmount + transportAmount - discountAmount - couponDiscount;

    const booking = await prisma.booking.create({
      data: {
        userId: authUser!.id,
        packageId,
        departureLocationId: departureLocationId || null,
        travelDate: new Date(travelDate),
        numberOfPeople: parseInt(numberOfPeople),
        packageAmount,
        transportAmount,
        discountAmount,
        couponDiscount,
        couponId,
        totalAmount,
        status: 'PENDING',
        phone: phone || null,
      },
      include: {
        package: true,
        departureLocation: true,
      },
    });

    await prisma.package.update({
      where: { id: packageId },
      data: { availableSeats: { decrement: parseInt(numberOfPeople) } },
    });

    return successResponse(booking, 'Booking created', 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to create booking', 500);
  }
}
