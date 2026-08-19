import { NextRequest } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { sendBookingConfirmation } from '@/lib/email.service';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return errorResponse('Missing payment verification fields', 400);
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return errorResponse('Payment verification failed', 400);
    }

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

    // Send booking confirmation email to user
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: { select: { name: true, email: true } },
          package: { select: { name: true, destination: true, state: true } },
        },
      });
      if (booking && booking.user && booking.package) {
        await sendBookingConfirmation(booking.user.email, booking.user.name, {
          packageName: booking.package.name,
          destination: `${booking.package.destination}, ${booking.package.state}`,
          travelDate: new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          numberOfPeople: booking.numberOfPeople,
          totalAmount: booking.totalAmount,
          bookingId: booking.id,
        });
      }
    } catch (emailErr) {
      // Don't fail the payment verification if email fails
      console.error('Failed to send confirmation email:', emailErr);
    }

    return successResponse(null, 'Payment verified successfully');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Payment verification error', 500);
  }
}
