'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Booking } from '@/lib/types';
import toast from 'react-hot-toast';
import { CheckCircle, CreditCard, Calendar, Users, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    api.get(`/api/bookings/${id}`)
      .then((res) => setBooking(res.data.data))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePayment = async () => {
    setPayLoading(true);
    try {
      const orderRes = await api.post('/api/payments/create-order', { bookingId: id });
      const { orderId, amount, currency, keyId } = orderRes.data.data;

      const options: RazorpayOptions = {
        key: keyId,
        amount,
        currency,
        name: 'TourEase',
        description: booking?.package?.name || 'Tourism Package',
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: id,
            });
            toast.success('Payment successful! Booking confirmed.');
            router.push('/my-bookings');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return (
    <><Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    </>
  );

  if (!booking) return (
    <><Navbar /><div className="text-center py-20 text-gray-500">Booking not found.</div></>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/my-bookings" className="flex items-center gap-2 text-blue-600 hover:underline mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> My Bookings
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Booking Summary</h1>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Package</span>
                <span className="font-semibold text-gray-800">{booking.package?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Destination</span>
                <span>{booking.package?.destination}, {booking.package?.state}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Travel Date</span>
                <span>{new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" />People</span>
                <span>{booking.numberOfPeople}</span>
              </div>
              {booking.departureLocation && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Departure</span>
                  <span>{booking.departureLocation.departureCity} via {booking.departureLocation.transportMode}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[booking.status]}`}>
                  {booking.status}
                </span>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Package amount</span>
                  <span>₹{booking.packageAmount.toLocaleString()}</span>
                </div>
                {booking.transportAmount > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Transport amount</span>
                    <span>₹{booking.transportAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 text-lg border-t pt-2">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {booking.status === 'CONFIRMED' ? (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 p-4 rounded-xl">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Payment complete — booking confirmed!</span>
              </div>
            ) : booking.status === 'CANCELLED' ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">Booking has been cancelled.</div>
            ) : (
              <button onClick={handlePayment} disabled={payLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60">
                <CreditCard className="w-5 h-5" />
                {payLoading ? 'Processing...' : `Pay ₹${booking.totalAmount.toLocaleString()} via Razorpay`}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
