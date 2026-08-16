import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { bookingId } = await request.json();
    if (!bookingId) {
      return errorResponse('bookingId is required', 400);
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    if (booking.userId !== authUser!.id) {
      return errorResponse('Access denied', 403);
    }

    if (booking.status === 'CONFIRMED') {
      return errorResponse('Booking already paid', 400);
    }

    const amount = Math.round(booking.totalAmount * 100);

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
    });

    await prisma.payment.upsert({
      where: { bookingId },
      update: { razorpayOrderId: order.id, amount: booking.totalAmount, status: 'PENDING' },
      create: {
        bookingId,
        razorpayOrderId: order.id,
        amount: booking.totalAmount,
        status: 'PENDING',
      },
    });

    return successResponse({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    }, 'Order created');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to create payment order', 500);
  }
}
