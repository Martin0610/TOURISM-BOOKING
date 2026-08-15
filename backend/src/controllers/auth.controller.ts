import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      errorResponse(res, 'Name, email and password are required', 400);
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      errorResponse(res, 'Email already registered', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashedPassword, phone },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = generateToken({ id: user.id, role: user.role });
    successResponse(res, { user, token }, 'Registration successful', 201);
  } catch (err) {
    errorResponse(res, 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      errorResponse(res, 'Email and password are required', 400);
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      errorResponse(res, 'No account found with this email address', 401);
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errorResponse(res, 'Incorrect password. Please try again', 401);
      return;
    }

    const token = generateToken({ id: user.id, role: user.role });
    successResponse(res, {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    }, 'Login successful');
  } catch {
    errorResponse(res, 'Login failed', 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }
    successResponse(res, user);
  } catch {
    errorResponse(res, 'Failed to get user', 500);
  }
};
