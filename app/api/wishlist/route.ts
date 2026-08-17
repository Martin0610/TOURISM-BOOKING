import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const items = await prisma.wishlist.findMany({
      where: { userId: authUser!.id },
      include: { package: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return successResponse(items);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to fetch wishlist', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    requireAuth(authUser);

    const { packageId } = await request.json();
    if (!packageId) {
      return errorResponse('packageId is required', 400);
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return errorResponse('Package not found', 404);
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_packageId: { userId: authUser!.id, packageId } },
    });
    if (existing) {
      return errorResponse('Package already in wishlist', 409);
    }

    const item = await prisma.wishlist.create({
      data: { userId: authUser!.id, packageId },
      include: { 
        package: { 
          select: { name: true, destination: true, pricePerPerson: true, imageUrl: true } 
        } 
      },
    });
    
    return successResponse(item, 'Added to wishlist', 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    return errorResponse('Failed to add to wishlist', 500);
  }
}
