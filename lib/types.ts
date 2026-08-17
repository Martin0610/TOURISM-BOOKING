export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  destination: string;
  state: string;
  description: string;
  shortDescription: string;
  pricePerPerson: number;
  durationDays: number;
  durationNights: number;
  category: string;
  availableSeats: number;
  hotelCategory: string;
  accommodation: string;
  mealsIncluded: string;
  transportIncluded: boolean;
  sightseeingIncluded: boolean;
  bestTimeToVisit: string;
  itinerary: string;
  inclusions: string;
  exclusions: string;
  cancellationPolicy: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartureLocation {
  id: string;
  departureCity: string;
  departureState: string;
  destination: string;
  transportMode: 'FLIGHT' | 'TRAIN' | 'BUS';
  transportPrice: number;
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  departureLocationId?: string;
  travelDate: string;
  numberOfPeople: number;
  packageAmount: number;
  transportAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  package?: Package;
  departureLocation?: DepartureLocation;
  user?: User;
  payment?: Payment;
  review?: { id: string } | null;
}

export interface Payment {
  id: string;
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
