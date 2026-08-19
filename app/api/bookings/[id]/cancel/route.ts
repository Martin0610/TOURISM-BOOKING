import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { sendCancellationEmail } from '@/lib/email.service';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        package: { select: { name: true, destination: true, state: true } },
        payment: true,
      },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    if (booking.userId !== authUser!.id && authUser!.role !== 'ADMIN') {
      return errorResponse('Access denied', 403);
    }

    if (booking.status === 'CANCELLED') {
      return errorResponse('Booking already cancelled', 400);
    }

    // Block cancellation within 7 days of travel
    const daysUntilTravel = Math.ceil((new Date(booking.travelDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilTravel <= 7) {
      return errorResponse('Cancellation is not allowed within 7 days of travel date', 400);
    }

    // Cancel the booking
    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Restore seats
    await prisma.package.update({
      where: { id: booking.packageId },
      data: { availableSeats: { increment: booking.numberOfPeople } },
    });

    // Trigger Razorpay refund if payment was made
    let refundApplicable = false;
    if (booking.payment?.razorpayPaymentId && booking.payment.status === 'SUCCESS') {
      try {
        await razorpay.payments.refund(booking.payment.razorpayPaymentId, {
          amount: Math.round(booking.totalAmount * 100), // amount in paise
          speed: 'normal',
          notes: { reason: 'Booking cancelled by user', bookingId: id },
        });
        await prisma.payment.update({
          where: { bookingId: id },
          data: { status: 'FAILED' }, // mark as refunded/failed
        });
        refundApplicable = true;
      } catch (refundErr) {
        console.error('Razorpay refund failed:', refundErr);
        // Don't block cancellation if refund API fails — handle manually
      }
    }

    // Send cancellation email
    if (booking.user && booking.package) {
      try {
        await sendCancellationEmail(booking.user.email, booking.user.name, {
          packageName: booking.package.name,
          destination: `${booking.package.destination}, ${booking.package.state}`,
          travelDate: new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          numberOfPeople: booking.numberOfPeople,
          totalAmount: booking.totalAmount,
          bookingId: booking.id,
          refundApplicable,
        });
      } catch (emailErr) {
        console.error('Cancellation email failed:', emailErr);
      }
    }

    return successResponse(null, 'Booking cancelled');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    console.error('Cancel booking error:', err);
    return errorResponse(`Failed to cancel booking: ${err instanceof Error ? err.message : String(err)}`, 500);
  }
}
