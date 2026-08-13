'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Package } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Clock, Users, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PackageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ travelDate: '', numberOfPeople: 1 });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    api.get(`/api/packages/${id}`)
      .then((res) => setPkg(res.data.data))
      .catch(() => toast.error('Package not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    setBookingLoading(true);
    try {
      const res = await api.post('/api/bookings', {
        packageId: id,
        travelDate: booking.travelDate,
        numberOfPeople: booking.numberOfPeople,
      });
      const bookingId = res.data.data.id;
      toast.success('Booking created! Proceeding to payment...');
      router.push(`/booking/${bookingId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    </>
  );

  if (!pkg) return (
    <>
      <Navbar />
      <div className="text-center py-20 text-gray-500">Package not found.</div>
    </>
  );

  const totalPrice = pkg.price * booking.numberOfPeople;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/packages" className="flex items-center gap-2 text-blue-600 hover:underline mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-64 bg-gradient-to-br from-blue-400 to-indigo-500">
                  {pkg.imageUrl ? (
                    <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">🌍</div>
                  )}
                </div>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{pkg.name}</h1>
                  <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-500" />{pkg.destination}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" />{pkg.duration} days</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-500" />{pkg.availableSeats} seats available</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{pkg.description}</p>
                </div>
              </div>

              {pkg.itinerary && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">Itinerary</h2>
                  <p className="text-gray-600 whitespace-pre-line">{pkg.itinerary}</p>
                </div>
              )}
            </div>

            {/* Right: Booking */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <div className="text-3xl font-bold text-blue-600 mb-1">₹{pkg.price.toLocaleString()}</div>
                <p className="text-gray-400 text-sm mb-6">per person</p>

                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Travel Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={booking.travelDate}
                      onChange={(e) => setBooking({ ...booking, travelDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Number of People
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={pkg.availableSeats}
                      value={booking.numberOfPeople}
                      onChange={(e) => setBooking({ ...booking, numberOfPeople: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>₹{pkg.price.toLocaleString()} × {booking.numberOfPeople}</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-blue-600">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading || pkg.availableSeats === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {pkg.availableSeats === 0 ? 'Sold Out' : bookingLoading ? 'Processing...' : 'Book Now'}
                  </button>
                  {!user && <p className="text-xs text-center text-gray-400">You need to login to book.</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
