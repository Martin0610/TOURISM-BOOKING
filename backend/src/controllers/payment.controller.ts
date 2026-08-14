import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendBookingConfirmationEmail } from '../services/email.service';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      errorResponse(res, 'bookingId is required', 400);
      return;
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      errorResponse(res, 'Booking not found', 404);
      return;
    }

    if (booking.userId !== req.user!.id) {
      errorResponse(res, 'Access denied', 403);
      return;
    }

    if (booking.status === 'CONFIRMED') {
      errorResponse(res, 'Booking already paid', 400);
      return;
    }

    // Amount in paise (INR smallest unit)
    const amount = Math.round(booking.totalAmount * 100);

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
    });

    // Save payment record
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

    successResponse(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    }, 'Order created');
  } catch {
    errorResponse(res, 'Failed to create payment order', 500);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      errorResponse(res, 'Missing payment verification fields', 400);
      return;
    }

    // Verify signature on backend
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      errorResponse(res, 'Payment verification failed', 400);
      return;
    }

    // Update payment and booking status
    await prisma.payment.update({
      where: { bookingId },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'SUCCESS',
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    // Send confirmation email (non-blocking)
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          package: true,
          departureLocation: true,
        },
      });

      if (booking && booking.user && booking.package) {
        await sendBookingConfirmationEmail({
          userName: booking.user.name,
          userEmail: booking.user.email,
          packageName: booking.package.name,
          destination: booking.package.destination,
          state: booking.package.state,
          travelDate: booking.travelDate.toISOString(),
          numberOfPeople: booking.numberOfPeople,
          departureCity: booking.departureLocation?.departureCity,
          transportMode: booking.departureLocation?.transportMode,
          packageAmount: booking.packageAmount,
          transportAmount: booking.transportAmount,
          discountAmount: (booking as { discountAmount?: number }).discountAmount ?? 0,
          totalAmount: booking.totalAmount,
          bookingId: booking.id,
          cancellationPolicy: booking.package.cancellationPolicy,
        });
      }
    } catch (emailErr) {
      console.error('Email send failed (non-blocking):', emailErr);
    }

    successResponse(res, null, 'Payment verified successfully');
  } catch {
    errorResponse(res, 'Payment verification error', 500);
  }
};
