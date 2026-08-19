'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Booking } from '@/lib/types';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, CreditCard, Calendar, Users, MapPin, ArrowLeft, 
  Star, Plane, ShieldCheck, QrCode, Sparkles, Phone, Download, 
  Printer, AlertTriangle, ArrowRight, Clock, Building
} from 'lucide-react';
import Link from 'next/link';
import WhatsAppButton from '@/components/WhatsAppButton';

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

const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Payment Pending', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300' },
  CONFIRMED: { label: 'Booking Confirmed', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300' },
  CANCELLED: { label: 'Trip Cancelled', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300' },
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
      .catch(() => setLoading(false))
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
        name: 'TripEase Holidays',
        description: booking?.package?.name || 'Tourism Package Confirmation',
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: id,
            });
            toast.success('Payment verified successfully! 🎉');
            router.push('/my-bookings');
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to initialize Razorpay checkout');
    } finally {
      setPayLoading(false);
    }
  };

  const printVoucher = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading travel voucher...</p>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="text-center py-28 px-4 max-w-md mx-auto">
          <AlertTriangle className="w-14 h-14 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Booking Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">We couldn&apos;t locate this booking reference.</p>
          <Link href="/my-bookings" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-full transition">
            Go to My Bookings
          </Link>
        </div>
      </>
    );
  }

  const badge = statusBadges[booking.status] || statusBadges.PENDING;

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb back */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/my-bookings"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" /> All Bookings
            </Link>

            {booking.status === 'CONFIRMED' && (
              <button
                onClick={printVoucher}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print E-Ticket
              </button>
            )}
          </div>

          {/* Boarding Pass / Travel Voucher Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative">
            {/* Top Glowing Header Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase block mb-1">
                    CONFIRMATION VOUCHER #{booking.id.slice(-8).toUpperCase()}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {booking.package?.name}
                  </h1>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> {booking.package?.destination}, {booking.package?.state}
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Perforation Divider Line */}
            <div className="relative flex items-center">
              <div className="w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full -ml-3 border-r border-slate-200 dark:border-slate-800" />
              <div className="flex-1 border-b-2 border-dashed border-slate-200 dark:border-slate-800 mx-2" />
              <div className="w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full -mr-3 border-l border-slate-200 dark:border-slate-800" />
            </div>

            {/* Ticket Specs Matrix */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span className="text-slate-400 block mb-1 font-medium">Travel Date</span>
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span className="text-slate-400 block mb-1 font-medium">Passengers</span>
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-500" />
                    {booking.numberOfPeople} Traveler{booking.numberOfPeople > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span className="text-slate-400 block mb-1 font-medium">Contact Phone</span>
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    {booking.phone || 'On file'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span className="text-slate-400 block mb-1 font-medium">Transit Departure</span>
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-amber-500" />
                    {booking.departureLocation ? `${booking.departureLocation.departureCity}` : 'Self Arranged'}
                  </span>
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Package Fare ({booking.numberOfPeople} pax)</span>
                  <span>₹{booking.packageAmount.toLocaleString()}</span>
                </div>

                {booking.transportAmount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Transit & Departure Surcharge</span>
                    <span>+₹{booking.transportAmount.toLocaleString()}</span>
                  </div>
                )}

                {(booking.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Special Group Discount / Offer</span>
                    <span>-₹{(booking.discountAmount ?? 0).toLocaleString()}</span>
                  </div>
                )}

                {(booking.couponDiscount ?? 0) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Promotional Coupon Discount</span>
                    <span>-₹{(booking.couponDiscount ?? 0).toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline font-extrabold text-sm text-slate-900 dark:text-white">
                  <span>Total Bill Amount</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                    ₹{booking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons based on Status */}
              {booking.status === 'CONFIRMED' ? (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Payment Complete — Booking Verified!
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Your hotel & guide vouchers are locked. You can present this digital pass upon arrival.
                      </p>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300">
                    <span className="font-bold block mb-1">🎉 Wishing you an unforgettable vacation!</span>
                    <span>24/7 Trip Concierge: +91 72003 36447 | mjv3140@gmail.com</span>
                  </div>
                </div>
              ) : booking.status === 'CANCELLED' ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-center space-y-1">
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    This booking has been cancelled
                  </h4>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">
                    Refunds are initiated back to the original source and reflect within 5–7 banking days.
                  </p>
                </div>
              ) : (
                /* PENDING PAYMENT */
                <div className="space-y-4">
                  <button
                    onClick={handlePayment}
                    disabled={payLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-teal-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {payLoading ? 'Connecting Gateway...' : `Pay ₹${booking.totalAmount.toLocaleString()} via Razorpay`}
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-bit Encrypted
                    </span>
                    <span>·</span>
                    <span>UPI / Cards / NetBanking</span>
                    <span>·</span>
                    <span>Instant E-Receipt</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
