import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthUser, requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (!pkg) {
      return errorResponse('Package not found', 404);
    }
    return successResponse(pkg);
  } catch {
    return errorResponse('Failed to fetch package', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { id } = await params;
    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Package not found', 404);
    }

    const body = await request.json();
    const pkg = await prisma.package.update({ 
      where: { id }, 
      data: body 
    });
    return successResponse(pkg, 'Package updated');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to update package', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    requireAdmin(authUser);

    const { id } = await params;
    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Package not found', 404);
    }

    await prisma.package.delete({ where: { id } });
    return successResponse(null, 'Package deleted');
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return errorResponse('Authentication required', 401);
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse('Admin access required', 403);
    }
    return errorResponse('Failed to delete package', 500);
  }
}
