import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    const announcements = await prisma.vipAnnouncement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return successResponse(announcements);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch VIP announcements', 500);
  }
}
