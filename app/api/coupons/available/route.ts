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
        select: { couponCode: true, title: true, discount: true },
      }),
    ]);

    const vipCodeSet = new Set(
      vipAnnouncements.map((a) => a.couponCode?.toUpperCase()).filter(Boolean)
    );

    const enrichedCoupons = coupons.map((c) => ({
      ...c,
      isVip: c.code.toUpperCase().startsWith('VIP') || vipCodeSet.has(c.code.toUpperCase()),
    }));

    return NextResponse.json({ success: true, data: enrichedCoupons });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
