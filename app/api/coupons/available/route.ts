import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const [coupons, vipAnnouncements] = await Promise.all([
      prisma.coupon.findMany({
        where: {
          active: true,
          expiresAt: { gte: new Date() },
        },
        orderBy: { discountValue: 'desc' },
      }),
      prisma.vipAnnouncement.findMany({
        where: { active: true, couponCode: { not: null } },
        select: { couponCode: true, title: true, discount: true, packageId: true, packageName: true },
      }),
    ]);

    const announcementMap = new Map(
      vipAnnouncements
        .filter((a) => a.couponCode)
        .map((a) => [a.couponCode!.toUpperCase(), a])
    );

    const enrichedCoupons = coupons.map((c) => {
      const match = announcementMap.get(c.code.toUpperCase());
      const isVip = c.isVipOnly || c.code.toUpperCase().startsWith('VIP') || !!match;
      return {
        ...c,
        isVip,
        packageId: c.packageId || match?.packageId || null,
        packageName: c.packageName || match?.packageName || null,
      };
    });

    return NextResponse.json({ success: true, data: enrichedCoupons });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
