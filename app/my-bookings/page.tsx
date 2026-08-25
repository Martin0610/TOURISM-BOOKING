'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Booking } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, Plane, Calendar, Users, MapPin, Star, 
  CreditCard, ArrowRight, XCircle, Sparkles, Luggage, 
  AlertCircle, ChevronRight, MessageSquare
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import Footer from '@/components/Footer';
import ConfirmDialog from '@/components/ConfirmDialog';

function ReviewForm({ bookingId, packageId, onDone }: { bookingId: string; packageId: string; onDone: () => void }) {
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/api/reviews', { packageId, bookingId, rating, comment });
      setSubmitted(true);
      setShow(false);
      toast.success('Thank you! Your review has been submitted.');
      onDone();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" /> Review Submitted
      </div>
    );
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
      >
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Write Review
      </button>
    );
  }

  return (
    <div className="w-full mt-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800 dark:text-white">Rate your experience:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" onClick={() => setRating(s)} className="p-0.5 cursor-pointer">
              <Star
                className={`w-4 h-4 transition-transform hover:scale-110 ${
                  s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="How was the hotel, itinerary, and guide experience?"
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 transition cursor-pointer"
        >
          {loading ? 'Submitting...' : 'Post Review'}
        </button>
        <button
          onClick={() => setShow(false)}
          className="text-slate-500 hover:text-slate-700 text-xs px-2 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  PENDING: {
    label: 'Payment Pending',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  CONFIRMED: {
    label: 'Confirmed',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
};

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      api.get('/api/bookings')
        .then((res) => setBookings(res.data.data || []))
        .catch(() => setBookings([]))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleCancel = (bookingId: string) => {
    setCancelConfirmId(bookingId);
  };

  const handleConfirmCancel = async () => {
    if (!cancelConfirmId) return;
    const bookingId = cancelConfirmId;
    setCancelConfirmId(null);
    try {
      await api.post(`/api/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      toast.success('Booking cancelled. Refund will be processed in 5–7 days.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to cancel booking';
      toast.error(msg);
    }
  };

  const canCancel = (travelDate: string) => {
    const daysUntilTravel = Math.ceil((new Date(travelDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilTravel > 7;
  };

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        {/* Header Banner */}
        <section className="bg-slate-900 text-white pt-24 pb-12 px-4 border-b border-slate-800 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs font-medium text-slate-300 mb-2.5">
              <Luggage className="w-3.5 h-3.5 text-blue-400" />
              <span>Travel Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              My Tour Bookings
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Manage your confirmed vacations, review vouchers, and monitor trip schedules.
            </p>
          </div>
        </section>

        {/* Bookings List */}
        <div className="max-w-4xl mx-auto px-4 pt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl h-40 animate-pulse border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <Luggage className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">No bookings found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                You haven&apos;t booked any dream getaways yet. Explore our handcrafted packages today!
              </p>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition shadow-sm"
              >
                <span>Browse Tourism Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const conf = statusConfig[booking.status] || statusConfig.PENDING;
                return (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition overflow-hidden"
                  >
                    {/* Header Bar */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-mono font-medium text-slate-400">
                            #{booking.id.slice(-8).toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${conf.badgeClass}`}>
                            {conf.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                          {booking.package?.name}
                        </h3>
                      </div>

                      <div className="sm:text-right">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">
                          ₹{booking.totalAmount.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {booking.numberOfPeople} Traveler{booking.numberOfPeople > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Metadata matrix */}
                    <div className="p-4 sm:p-5 space-y-3.5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          <span>{booking.package?.destination}, {booking.package?.state}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>{new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Plane className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span>
                            {booking.departureLocation
                              ? `${booking.departureLocation.departureCity} (${booking.departureLocation.transportMode})`
                              : 'Self Arranged'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Actions Bar */}
                      <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {booking.status === 'PENDING' && (
                            <Link
                              href={`/booking/${booking.id}`}
                              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Complete Payment</span>
                            </Link>
                          )}

                          {booking.status === 'CONFIRMED' && (
                            <Link
                              href={`/booking/${booking.id}`}
                              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm"
                            >
                              <span>View E-Voucher</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {booking.status === 'CONFIRMED' && !booking.review && (
                            <ReviewForm
                              bookingId={booking.id}
                              packageId={booking.packageId}
                              onDone={() => {
                                setBookings((prev) =>
                                  prev.map((b) =>
                                    b.id === booking.id
                                      ? ({ ...b, review: { submitted: true } as unknown as typeof b.review })
                                      : b
                                  )
                                );
                              }}
                            />
                          )}
                        </div>

                        {booking.status !== 'CANCELLED' && (
                          canCancel(booking.travelDate.toString()) ? (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline transition cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          ) : (
                            <span
                              className="text-[11px] text-slate-400 cursor-not-allowed"
                              title="Cancellation is only available at least 7 days before departure date."
                            >
                              Cancellation Closed (&lt;7 days)
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!cancelConfirmId}
        title="Cancel Vacation Booking"
        message="Are you sure you want to cancel this booking? Stays will be released and your refund will be initiated."
        confirmLabel="Yes, Cancel Booking"
        variant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelConfirmId(null)}
      />

      <Footer />
    </>
  );
}
