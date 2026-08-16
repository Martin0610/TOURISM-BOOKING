import { Response } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: { package: true },
      orderBy: { createdAt: 'desc' },
    });
    successResponse(res, items);
  } catch {
    errorResponse(res, 'Failed to fetch wishlist', 500);
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { packageId } = req.body;
    if (!packageId) { errorResponse(res, 'packageId is required', 400); return; }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) { errorResponse(res, 'Package not found', 404); return; }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_packageId: { userId: req.user!.id, packageId } },
    });
    if (existing) { errorResponse(res, 'Package already in wishlist', 409); return; }

    const item = await prisma.wishlist.create({
      data: { userId: req.user!.id, packageId },
      include: { package: { select: { name: true, destination: true, pricePerPerson: true, imageUrl: true } } },
    });
    successResponse(res, item, 'Added to wishlist', 201);
  } catch {
    errorResponse(res, 'Failed to add to wishlist', 500);
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const packageId = req.params.packageId as string;
    const existing = await prisma.wishlist.findUnique({
      where: { userId_packageId: { userId: req.user!.id, packageId } },
    });
    if (!existing) { errorResponse(res, 'Package not in wishlist', 404); return; }

    await prisma.wishlist.delete({
      where: { userId_packageId: { userId: req.user!.id, packageId } },
    });
    successResponse(res, null, 'Removed from wishlist');
  } catch {
    errorResponse(res, 'Failed to remove from wishlist', 500);
  }
};
