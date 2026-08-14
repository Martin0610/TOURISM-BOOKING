'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Booking } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar, Users, MapPin, Plane } from 'lucide-react';

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
      await api.delete(`/api/bookings/${bookingId}`);
      toast.success('Booking cancelled');
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl mb-4">No bookings yet.</p>
              <Link href="/packages" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
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
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          {booking.package?.destination}, {booking.package?.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          {new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
                        </span>
                        {booking.departureLocation && (
                          <span className="flex items-center gap-1">
                            <Plane className="w-3.5 h-3.5 text-blue-400" />
                            From {booking.departureLocation.departureCity}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-600 font-bold text-xl">₹{booking.totalAmount.toLocaleString()}</div>
                      {booking.transportAmount > 0 && (
                        <div className="text-gray-400 text-xs">
                          Pkg ₹{booking.packageAmount.toLocaleString()} + Travel ₹{booking.transportAmount.toLocaleString()}
                        </div>
                      )}
                      <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold mt-1 ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    {booking.status === 'PENDING' && (
                      <Link href={`/booking/${booking.id}`}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition">
                        Pay Now
                      </Link>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <Link href={`/booking/${booking.id}`}
                        className="bg-green-50 text-green-700 px-4 py-1.5 rounded-lg text-sm hover:bg-green-100 transition">
                        View Details
                      </Link>
                    )}
                    {booking.status !== 'CANCELLED' && (
                      <button onClick={() => handleCancel(booking.id)}
                        className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-sm hover:bg-red-100 transition">
                        Cancel
                      </button>
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
