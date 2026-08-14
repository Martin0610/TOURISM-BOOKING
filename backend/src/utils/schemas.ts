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

const numPos = z.union([z.number(), z.string()]).transform(Number).refine((v) => v > 0, 'Must be positive');
const numNonNeg = z.union([z.number(), z.string()]).transform(Number).refine((v) => v >= 0, 'Cannot be negative');

export const createPackageSchema = z.object({
  name: z.string().min(2, 'Package name is required'),
  destination: z.string().min(2, 'Destination is required'),
  state: z.string().min(2, 'State is required'),
  shortDescription: z.string().min(10, 'Short description required'),
  description: z.string().min(20, 'Full description required'),
  pricePerPerson: numPos,
  durationDays: numPos,
  durationNights: numNonNeg,
  category: z.string().min(2, 'Category is required'),
  availableSeats: numNonNeg,
  hotelCategory: z.string().min(2, 'Hotel category is required'),
  accommodation: z.string().min(2, 'Accommodation is required'),
  mealsIncluded: z.string().min(2, 'Meals info is required'),
  transportIncluded: z.boolean().optional().default(false),
  sightseeingIncluded: z.boolean().optional().default(true),
  bestTimeToVisit: z.string().min(2, 'Best time to visit is required'),
  itinerary: z.string().min(10, 'Itinerary is required'),
  inclusions: z.string().min(10, 'Inclusions are required'),
  exclusions: z.string().min(10, 'Exclusions are required'),
  cancellationPolicy: z.string().min(10, 'Cancellation policy is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const updatePackageSchema = z.object({
  name: z.string().min(2).optional(),
  destination: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  pricePerPerson: numPos.optional(),
  durationDays: numPos.optional(),
  durationNights: numNonNeg.optional(),
  category: z.string().optional(),
  availableSeats: numNonNeg.optional(),
  hotelCategory: z.string().optional(),
  accommodation: z.string().optional(),
  mealsIncluded: z.string().optional(),
  transportIncluded: z.boolean().optional(),
  sightseeingIncluded: z.boolean().optional(),
  bestTimeToVisit: z.string().optional(),
  itinerary: z.string().optional(),
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const createBookingSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  departureLocationId: z.string().optional(),
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
