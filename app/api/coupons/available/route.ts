import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        expiresAt: { gte: new Date() }
      },
      orderBy: { discountValue: 'desc' }
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
