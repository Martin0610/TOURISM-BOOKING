'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Booking } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CheckCircle, Plane, Calendar, Users, MapPin, Star } from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';

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
      onDone();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
      <CheckCircle className="w-4 h-4" /> Thanks for your feedback!
    </div>
  );

  if (!show) return (
    <button onClick={() => setShow(true)} className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-100 transition">
      <Star className="w-3.5 h-3.5" /> Write Review
    </button>
  );

  return (
    <div className="w-full mt-3 bg-yellow-50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Rate this package</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(s => (
          <button key={s} type="button" onClick={() => setRating(s)}>
            <Star className={`w-6 h-6 transition ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
        placeholder="Share your experience (optional)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading}
          className="bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-60 transition">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        <button onClick={() => setShow(false)} className="text-gray-500 text-sm px-2">Cancel</button>
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      api.get('/api/bookings')
        .then((res) => setBookings(res.data.data))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Cancel this booking? Seats will be restored.')) return;
    try {
      await api.delete(`/api/bookings/${bookingId}/cancel`);
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      toast.success('Booking cancelled');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to cancel');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl mb-4">No bookings yet.</p>
              <Link href="/packages" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition">
                Browse Packages
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{booking.package?.name}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-pink-500" />
                          {booking.package?.destination}, {booking.package?.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          {new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-teal-500" />
                          {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
                        </span>
                        {booking.departureLocation && (
                          <span className="flex items-center gap-1">
                            <Plane className="w-3.5 h-3.5 text-orange-500" />
                            From {booking.departureLocation.departureCity}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold text-xl">₹{booking.totalAmount.toLocaleString()}</div>
                      {booking.transportAmount > 0 && (
                        <div className="text-gray-400 text-xs">
                          Pkg ₹{booking.packageAmount.toLocaleString()} + Travel ₹{booking.transportAmount.toLocaleString()}
                        </div>
                      )}
                      {(booking as {discountAmount?: number}).discountAmount && (booking as {discountAmount?: number}).discountAmount! > 0 ? (
                        <div className="text-green-500 text-xs">Saved ₹{(booking as {discountAmount?: number}).discountAmount!.toLocaleString()}</div>
                      ) : null}
                      <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold mt-1 ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    {booking.status === 'PENDING' && (
                      <Link href={`/booking/${booking.id}`}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-lg text-sm hover:from-purple-700 hover:to-pink-700 transition">
                        Pay Now
                      </Link>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <Plane className="w-4 h-4" /> Have a safe and wonderful trip!
                      </div>
                    )}
                    {booking.status === 'CONFIRMED' && !booking.review && (
                      <ReviewForm bookingId={booking.id} packageId={booking.packageId} onDone={() => {
                        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, review: { submitted: true } as unknown as typeof b.review } : b));
                      }} />
                    )}
                    {booking.status !== 'CANCELLED' && (
                      canCancel(booking.travelDate) ? (
                        <button onClick={() => handleCancel(booking.id)}
                          className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-sm hover:bg-red-100 transition font-medium">
                          Cancel Booking
                        </button>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed" title="Cannot cancel within 7 days of travel">
                          No Cancellation
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
