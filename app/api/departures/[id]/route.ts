import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const departure = await prisma.departureLocation.findUnique({ 
      where: { id } 
    });
    
    if (!departure) {
      return errorResponse('Departure location not found', 404);
    }
    
    return successResponse(departure);
  } catch {
    return errorResponse('Failed to fetch departure location', 500);
  }
}
