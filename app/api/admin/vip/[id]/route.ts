import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

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
        reviewedAt: new Date(),
      },
    });

    const msg =
      status === 'APPROVED'
        ? 'VIP Member Approved successfully! ⭐'
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
