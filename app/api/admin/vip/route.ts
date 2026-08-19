import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';
import { sendVipAnnouncementEmail } from '@/lib/email.service';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    // Fetch all applicants, announcements, users and packages
    const [subscribers, announcements, allUsers, allPackages] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vipAnnouncement.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        include: {
          bookings: {
            include: {
              package: {
                select: { name: true, destination: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.package.findMany({
        select: { id: true, name: true, destination: true, state: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Build map of users by lowercased email
    const userMap = new Map<string, (typeof allUsers)[0]>();
    for (const u of allUsers) {
      userMap.set(u.email.toLowerCase(), u);
    }

    // Enrich subscribers with detailed travel stats
    const enrichedSubscribers = subscribers.map((sub) => {
      const matchedUser = userMap.get(sub.email.toLowerCase());

      if (!matchedUser) {
        return {
          id: sub.id,
          email: sub.email,
          status: sub.status,
          active: sub.active,
          createdAt: sub.createdAt,
          reviewedAt: sub.reviewedAt,
          isRegistered: false,
          userName: 'Unregistered Guest',
          userPhone: null,
          totalBookings: 0,
          confirmedBookings: 0,
          totalSpent: 0,
          latestBooking: null,
        };
      }

      const totalBookings = matchedUser.bookings.length;
      const confirmedBookings = matchedUser.bookings.filter((b) => b.status === 'CONFIRMED');
      const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const latest = matchedUser.bookings[0] || null;

      return {
        id: sub.id,
        email: sub.email,
        status: sub.status,
        active: sub.active,
        createdAt: sub.createdAt,
        reviewedAt: sub.reviewedAt,
        isRegistered: true,
        userName: matchedUser.name,
        userPhone: matchedUser.phone || null,
        totalBookings,
        confirmedBookings: confirmedBookings.length,
        totalSpent,
        latestBooking: latest
          ? {
              destination: latest.package?.destination || 'Tour',
              packageName: latest.package?.name || 'Tour Package',
              travelDate: latest.travelDate,
              status: latest.status,
              amount: latest.totalAmount,
            }
          : null,
      };
    });

    const pending = enrichedSubscribers.filter((s) => s.status === 'PENDING');
    const approved = enrichedSubscribers.filter((s) => s.status === 'APPROVED');
    const rejected = enrichedSubscribers.filter((s) => s.status === 'REJECTED');

    return successResponse({
      subscribers: enrichedSubscribers,
      pendingApplicants: pending,
      approvedMembers: approved,
      rejectedApplicants: rejected,
      announcements,
      packages: allPackages,
      stats: {
        totalApplicants: enrichedSubscribers.length,
        pendingCount: pending.length,
        approvedCount: approved.length,
        rejectedCount: rejected.length,
        totalVipSpending: approved.reduce((sum, a) => sum + a.totalSpent, 0),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to fetch VIP data', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { title, message, couponCode, discount, packageId, packageName } = await request.json();

    if (!title?.trim() || !message?.trim()) {
      return errorResponse('Announcement title and message are required', 400);
    }

    if (!couponCode?.trim() || !discount?.trim()) {
      return errorResponse('Coupon code and discount badge are required for VIP announcements', 400);
    }

    const cleanCode = couponCode.toUpperCase().trim();
    const cleanDiscount = discount.trim();
    const targetPackageId = packageId && packageId !== 'ALL' ? packageId : null;
    const targetPackageName = targetPackageId ? (packageName || 'Exclusive Package') : 'All Packages';

    // Auto-create or sync Coupon record in database with VIP exclusive flag
    let discountType = 'PERCENTAGE';
    let discountValue = 15; // default 15%

    const raw = cleanDiscount;
    if (raw.includes('%')) {
      discountType = 'PERCENTAGE';
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0) discountValue = num;
    } else {
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0) {
        if (num <= 100 && !raw.includes('₹') && !raw.toLowerCase().includes('rs')) {
          discountType = 'PERCENTAGE';
          discountValue = num;
        } else {
          discountType = 'FIXED';
          discountValue = num;
        }
      }
    }

    const existingCoupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    if (existingCoupon) {
      await prisma.coupon.update({
        where: { id: existingCoupon.id },
        data: {
          discountType,
          discountValue,
          active: true,
          isVipOnly: true,
          packageId: targetPackageId,
          packageName: targetPackageName,
          expiresAt: sixtyDaysLater,
        },
      });
    } else {
      await prisma.coupon.create({
        data: {
          code: cleanCode,
          discountType,
          discountValue,
          minBookingAmount: 0,
          maxUses: 1000,
          usedCount: 0,
          expiresAt: sixtyDaysLater,
          active: true,
          isVipOnly: true,
          packageId: targetPackageId,
          packageName: targetPackageName,
        },
      });
    }

    const announcement = await prisma.vipAnnouncement.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        couponCode: cleanCode,
        discount: cleanDiscount,
        packageId: targetPackageId,
        packageName: targetPackageName,
        active: true,
      },
    });

    // Fetch all active APPROVED VIP members to dispatch personalized emails
    const approvedVips = await prisma.newsletterSubscriber.findMany({
      where: {
        status: 'APPROVED',
        active: true,
      },
    });

    // Send emails in background
    if (approvedVips.length > 0) {
      Promise.allSettled(
        approvedVips.map((vip) =>
          sendVipAnnouncementEmail(vip.email, {
            title: title.trim(),
            message: message.trim(),
            couponCode: cleanCode,
            discount: cleanDiscount,
            packageId: targetPackageId,
            packageName: targetPackageName,
          })
        )
      ).catch((err) => console.error('Failed to send some VIP emails:', err));
    }

    const memberMsg =
      approvedVips.length === 1 ? '1 VIP member' : `${approvedVips.length} VIP members`;

    return successResponse(
      announcement,
      `VIP Announcement published and dispatched to ${memberMsg} (${targetPackageName}).`,
      201
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to publish announcement', 500);
  }
}
