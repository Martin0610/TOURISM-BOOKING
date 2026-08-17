import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Delete existing coupons
    await prisma.coupon.deleteMany({});

    // Add departure locations
    const departures = [
      { departureCity: 'Mumbai', departureState: 'Maharashtra', transportMode: 'FLIGHT', transportPrice: 8000, destination: 'Delhi' },
      { departureCity: 'Bangalore', departureState: 'Karnataka', transportMode: 'FLIGHT', transportPrice: 6500, destination: 'Delhi' },
      { departureCity: 'Kolkata', departureState: 'West Bengal', transportMode: 'TRAIN', transportPrice: 2500, destination: 'Delhi' },
      { departureCity: 'Chennai', departureState: 'Tamil Nadu', transportMode: 'FLIGHT', transportPrice: 7500, destination: 'Agra' },
      { departureCity: 'Mumbai', departureState: 'Maharashtra', transportMode: 'FLIGHT', transportPrice: 9500, destination: 'Jaipur' },
      { departureCity: 'Bangalore', departureState: 'Karnataka', transportMode: 'FLIGHT', transportPrice: 5500, destination: 'Goa' },
      { departureCity: 'Delhi', departureState: 'Delhi', transportMode: 'FLIGHT', transportPrice: 4500, destination: 'Goa' },
      { departureCity: 'Mumbai', departureState: 'Maharashtra', transportMode: 'BUS', transportPrice: 1200, destination: 'Goa' },
      { departureCity: 'Delhi', departureState: 'Delhi', transportMode: 'FLIGHT', transportPrice: 12000, destination: 'Kashmir' },
      { departureCity: 'Mumbai', departureState: 'Maharashtra', transportMode: 'FLIGHT' as const, transportPrice: 15000, destination: 'Kashmir' },
      { departureCity: 'Bangalore', departureState: 'Karnataka', transportMode: 'FLIGHT' as const, transportPrice: 8500, destination: 'Alleppey' },
      { departureCity: 'Mumbai', departureState: 'Maharashtra', transportMode: 'FLIGHT' as const, transportPrice: 7000, destination: 'Alleppey' },
    ];

    await prisma.departureLocation.createMany({ data: departures as any, skipDuplicates: true });

    // Add coupons
    const coupons = [
      {
        code: 'SAVE33',
        discountType: 'PERCENTAGE',
        discountValue: 33,
        minBookingAmount: 50000,
        maxUses: 100,
        usedCount: 0,
        active: true,
        expiresAt: new Date('2026-09-30')
      },
    ];

    await prisma.coupon.createMany({ data: coupons, skipDuplicates: true });

    return NextResponse.json({ 
      success: true, 
      message: 'Sample departure locations and coupons added!'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
