import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    
    const departures = await prisma.departureLocation.findMany({
      where: {
        available: true,
        ...(destination && { destination: { contains: destination, mode: 'insensitive' } }),
      },
      orderBy: [{ destination: 'asc' }, { departureCity: 'asc' }],
    });
    
    return successResponse(departures);
  } catch {
    return errorResponse('Failed to fetch departure locations', 500);
  }
}
