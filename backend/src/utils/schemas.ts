import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createPackageSchema = z.object({
  name: z.string().min(2, 'Package name is required'),
  destination: z.string().min(2, 'Destination is required'),
  description: z.string().optional(),
  price: z.union([z.number(), z.string()]).transform(Number).refine((v) => v > 0, 'Price must be positive'),
  duration: z.union([z.number(), z.string()]).transform(Number).refine((v) => v > 0, 'Duration must be positive'),
  availableSeats: z.union([z.number(), z.string()]).transform(Number).refine((v) => v >= 0, 'Seats cannot be negative'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  itinerary: z.string().optional(),
});

export const updatePackageSchema = z.object({
  name: z.string().min(2).optional(),
  destination: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.union([z.number(), z.string()]).transform(Number).refine((v) => v > 0).optional(),
  duration: z.union([z.number(), z.string()]).transform(Number).refine((v) => v > 0).optional(),
  availableSeats: z.union([z.number(), z.string()]).transform(Number).refine((v) => v >= 0).optional(),
  imageUrl: z.string().optional(),
  itinerary: z.string().optional(),
});

export const createBookingSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  travelDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid travel date'),
  numberOfPeople: z.union([z.number(), z.string()]).transform(Number).refine((v) => v >= 1, 'At least 1 person required'),
});

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED'] as const, { message: 'Invalid status' }),
});

export const createOrderSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
  bookingId: z.string().min(1, 'Booking ID is required'),
});
