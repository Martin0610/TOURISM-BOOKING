import { Request, Response } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getPackages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { destination, state, category, minPrice, maxPrice, duration, search } = req.query;

    const packages = await prisma.package.findMany({
      where: {
        ...(destination && { destination: { contains: destination as string, mode: 'insensitive' } }),
        ...(state && { state: { contains: state as string, mode: 'insensitive' } }),
        ...(category && { category: { equals: category as string, mode: 'insensitive' } }),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { destination: { contains: search as string, mode: 'insensitive' } },
            { shortDescription: { contains: search as string, mode: 'insensitive' } },
            { state: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
        ...(minPrice && { pricePerPerson: { gte: parseFloat(minPrice as string) } }),
        ...(maxPrice && { pricePerPerson: { lte: parseFloat(maxPrice as string) } }),
        ...(duration && { durationDays: parseInt(duration as string) }),
      },
      orderBy: { createdAt: 'desc' },
    });

    successResponse(res, packages);
  } catch {
    errorResponse(res, 'Failed to fetch packages', 500);
  }
};

export const getPackageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (!pkg) { errorResponse(res, 'Package not found', 404); return; }
    successResponse(res, pkg);
  } catch {
    errorResponse(res, 'Failed to fetch package', 500);
  }
};

export const createPackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const pkg = await prisma.package.create({ data: req.body });
    successResponse(res, pkg, 'Package created', 201);
  } catch {
    errorResponse(res, 'Failed to create package', 500);
  }
};

export const updatePackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) { errorResponse(res, 'Package not found', 404); return; }

    const pkg = await prisma.package.update({ where: { id }, data: req.body });
    successResponse(res, pkg, 'Package updated');
  } catch {
    errorResponse(res, 'Failed to update package', 500);
  }
};

export const deletePackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) { errorResponse(res, 'Package not found', 404); return; }
    await prisma.package.delete({ where: { id } });
    successResponse(res, null, 'Package deleted');
  } catch {
    errorResponse(res, 'Failed to delete package', 500);
  }
};
