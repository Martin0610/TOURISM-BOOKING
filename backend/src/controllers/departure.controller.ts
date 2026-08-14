import { Request, Response } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getDepartures = async (req: Request, res: Response): Promise<void> => {
  try {
    const { destination } = req.query;
    const departures = await prisma.departureLocation.findMany({
      where: {
        available: true,
        ...(destination && { destination: { contains: destination as string, mode: 'insensitive' } }),
      },
      orderBy: [{ destination: 'asc' }, { departureCity: 'asc' }],
    });
    successResponse(res, departures);
  } catch {
    errorResponse(res, 'Failed to fetch departure locations', 500);
  }
};

export const getDepartureById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const departure = await prisma.departureLocation.findUnique({ where: { id } });
    if (!departure) {
      errorResponse(res, 'Departure location not found', 404);
      return;
    }
    successResponse(res, departure);
  } catch {
    errorResponse(res, 'Failed to fetch departure location', 500);
  }
};
