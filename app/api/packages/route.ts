import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const state = searchParams.get('state');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const duration = searchParams.get('duration');
    const search = searchParams.get('search');

    const packages = await prisma.package.findMany({
      where: {
        ...(destination && { destination: { contains: destination, mode: 'insensitive' } }),
        ...(state && { state: { contains: state, mode: 'insensitive' } }),
        ...(category && { category: { equals: category, mode: 'insensitive' } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { destination: { contains: search, mode: 'insensitive' } },
            { shortDescription: { contains: search, mode: 'insensitive' } },
            { state: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(minPrice && { pricePerPerson: { gte: parseFloat(minPrice) } }),
        ...(maxPrice && { pricePerPerson: { lte: parseFloat(maxPrice) } }),
        ...(duration && { durationDays: parseInt(duration) }),
      },
      orderBy: { createdAt: 'asc' },
    });

    return successResponse(packages);
  } catch (err) {
    console.error('Failed to fetch packages:', err);
    return errorResponse(`Failed to fetch packages: ${err instanceof Error ? err.message : String(err)}`, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const body = await request.json();
    const pkg = await prisma.package.create({ data: body });
    return successResponse(pkg, 'Package created', 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to create package', 500);
  }
}
