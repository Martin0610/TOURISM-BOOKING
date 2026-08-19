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
      <div className="print:hidden">
        <Navbar />
        <WhatsAppButton />
      </div>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-16 px-4 print:pt-0 print:pb-0 print:px-0 print:bg-white print:min-h-0">
        <div className="max-w-2xl mx-auto print:max-w-none print:w-full">
          {/* Breadcrumb back - Hidden on Print */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <Link
              href="/my-bookings"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> All Bookings
            </Link>

            {booking.status === 'CONFIRMED' && (
              <button
                onClick={printVoucher}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Save E-Ticket PDF
              </button>
            )}
          </div>

          {/* Boarding Pass / Travel Voucher Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative print:shadow-none print:border-2 print:border-slate-900 print:rounded-2xl print:bg-white print:text-black">
            
            {/* Top Header Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 relative print:bg-slate-900 print:text-white print:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono tracking-widest bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 rounded font-bold uppercase">
                      CONFIRMATION VOUCHER #{booking.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-300 font-semibold print:text-slate-300">
                      • TripEase Holidays
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {booking.package?.name}
                  </h1>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-1 print:text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> {booking.package?.destination}, {booking.package?.state}
                  </p>
                </div>

                <div className="sm:text-right flex-shrink-0">
                  <span className={`inline-block px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm ${badge.bg} ${badge.text} print:bg-emerald-600 print:text-white print:border-0`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Perforation Divider Line - Clean on Print */}
            <div className="relative flex items-center print:hidden">
              <div className="w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full -ml-3 border-r border-slate-200 dark:border-slate-800" />
              <div className="flex-1 border-b-2 border-dashed border-slate-200 dark:border-slate-800 mx-2" />
              <div className="w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full -mr-3 border-l border-slate-200 dark:border-slate-800" />
            </div>

            {/* Ticket Specs Matrix */}
            <div className="p-6 sm:p-7 space-y-6 print:p-5 print:space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs print:grid-cols-4 print:gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 print:border print:border-slate-300 print:bg-slate-50 print:rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold text-[11px] print:text-slate-600">Travel Date</span>
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 text-xs print:text-black">
                    <Calendar className="w-3.5 h-3.5 text-blue-500 print:hidden" />
                    {new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 print:border print:border-slate-300 print:bg-slate-50 print:rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold text-[11px] print:text-slate-600">Passengers</span>
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 text-xs print:text-black">
                    <Users className="w-3.5 h-3.5 text-cyan-500 print:hidden" />
                    {booking.numberOfPeople} Traveler{booking.numberOfPeople > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 print:border print:border-slate-300 print:bg-slate-50 print:rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold text-[11px] print:text-slate-600">Contact Phone</span>
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 text-xs print:text-black">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 print:hidden" />
                    {booking.phone || 'On file'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 print:border print:border-slate-300 print:bg-slate-50 print:rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold text-[11px] print:text-slate-600">Transit Departure</span>
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 text-xs print:text-black">
                    <Plane className="w-3.5 h-3.5 text-amber-500 print:hidden" />
                    {booking.departureLocation ? `${booking.departureLocation.departureCity}` : 'Self Arranged'}
                  </span>
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5 text-xs print:bg-white print:border print:border-slate-300 print:rounded-xl print:p-3.5 print:space-y-1.5">
                <div className="flex justify-between text-slate-700 dark:text-slate-300 print:text-slate-700">
                  <span className="font-medium">Package Base Fare ({booking.numberOfPeople} traveler{booking.numberOfPeople > 1 ? 's' : ''})</span>
                  <span className="font-bold">₹{booking.packageAmount.toLocaleString('en-IN')}</span>
                </div>

                {booking.transportAmount > 0 && (
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 print:text-slate-700">
                    <span className="font-medium">Transit & Departure City Surcharge</span>
                    <span className="font-bold">+₹{booking.transportAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {(booking.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold print:text-emerald-700">
                    <span>Special Group Discount / Offer</span>
                    <span>-₹{(booking.discountAmount ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {(booking.couponDiscount ?? 0) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold print:text-emerald-700">
                    <span>Promotional Coupon Discount</span>
                    <span>-₹{(booking.couponDiscount ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 print:border-slate-400 flex justify-between items-baseline font-black text-sm text-slate-900 dark:text-white print:text-black">
                  <span>Total Amount Paid (Tax Inclusive)</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-cyan-400 print:text-black">
                    ₹{booking.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Status Verification Notice */}
              {booking.status === 'CONFIRMED' ? (
                <div className="space-y-3 print:space-y-2">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 print:border print:border-emerald-600 print:bg-emerald-50 print:p-3 print:rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 print:text-emerald-900">
                        Payment Complete — Booking Verified & Confirmed!
                      </h4>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5 print:text-emerald-900">
                        Your hotel rooms & tour itinerary are guaranteed. Present this digital/printed voucher upon check-in.
                      </p>
                    </div>
                  </div>

                  {/* Travel Instructions for print */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 print:border-slate-300 print:bg-slate-50 print:text-slate-800 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white print:text-black">📌 Important Traveler Guidelines:</p>
                    <p>• Please carry a valid Government photo ID (Aadhaar Card, Passport, or Voter ID) for all traveling members.</p>
                    <p>• Standard hotel check-in time is 12:00 PM. Dedicated tour manager contact & vehicle details are shared via WhatsApp 24h prior to departure.</p>
                  </div>

                  <div className="text-center p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 print:bg-slate-100 print:border-slate-300 print:text-black">
                    <span className="font-bold block mb-0.5">Wishing you an extraordinary vacation!</span>
                    <span className="text-[11px] font-medium">24/7 Trip Concierge: +91 72003 36447 | Email: mjv3140@gmail.com</span>
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
                <div className="space-y-4 print:hidden">
                  <button
                    onClick={handlePayment}
                    disabled={payLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-teal-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {payLoading ? 'Connecting Gateway...' : `Pay ₹${booking.totalAmount.toLocaleString('en-IN')} via Razorpay`}
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
