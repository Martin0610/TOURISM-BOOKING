import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';
import { sendVipWelcomeEmail, sendVipPerksEmail } from '@/lib/email.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return errorResponse('Valid status (APPROVED, REJECTED, PENDING) is required', 400);
    }

    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        status,
        active: status === 'APPROVED' ? true : undefined,
        reviewedAt: new Date(),
      },
    });

    // If approved, send Welcome Email and Perks Guide Email in sequence
    if (status === 'APPROVED' && updated.email) {
      // Find registered user name if available
      const matchedUser = await prisma.user.findUnique({
        where: { email: updated.email.toLowerCase() },
        select: { name: true },
      });
      const memberName = matchedUser?.name || 'VIP Member';

      // 1. Send VIP Welcome & Dedication email
      sendVipWelcomeEmail(updated.email, memberName).catch((err) =>
        console.error('Failed to send VIP Welcome email:', err)
      );

      // 2. Send detailed VIP Perks & Privileges guide email 2.5s later
      setTimeout(() => {
        sendVipPerksEmail(updated.email, memberName).catch((err) =>
          console.error('Failed to send VIP Perks email:', err)
        );
      }, 2500);
    }

    const msg =
      status === 'APPROVED'
        ? 'VIP Member Approved! Welcome & Perks emails sent ⭐'
        : status === 'REJECTED'
        ? 'VIP Application declined.'
        : 'Status reset to pending.';

    return successResponse(updated, msg);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to update VIP status', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { id } = await params;
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'announcement';

    if (type === 'subscriber') {
      await prisma.newsletterSubscriber.delete({
        where: { id },
      });
      return successResponse(null, 'VIP Applicant removed successfully');
    }

    await prisma.vipAnnouncement.delete({
      where: { id },
    });

    return successResponse(null, 'Announcement deleted successfully');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to delete', 500);
  }
}
