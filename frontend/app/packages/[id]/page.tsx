'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Package, DepartureLocation } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Clock, Users, Calendar, ArrowLeft, Hotel, Utensils, CheckCircle, XCircle, Star } from 'lucide-react';
import Link from 'next/link';

export default function PackageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [departures, setDepartures] = useState<DepartureLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ travelDate: '', numberOfPeople: 1, departureLocationId: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkgRes = await api.get(`/api/packages/${id}`);
        const p: Package = pkgRes.data.data;
        setPkg(p);
        const depRes = await api.get(`/api/departures?destination=${encodeURIComponent(p.destination)}`);
        setDepartures(depRes.data.data);
      } catch {
        toast.error('Package not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const selectedDeparture = departures.find((d) => d.id === form.departureLocationId);
  const packageAmount = pkg ? pkg.pricePerPerson * form.numberOfPeople : 0;
  const transportAmount = selectedDeparture ? selectedDeparture.transportPrice * form.numberOfPeople : 0;
  // Discount logic: 3+ people = 20% off. 4+ people = 1 ticket free (pay for n-1 people for package)
  const freeTickets = form.numberOfPeople >= 4 ? Math.floor(form.numberOfPeople / 4) : 0;
  const paidPeople = form.numberOfPeople - freeTickets;
  const packageAmountAfterFree = pkg ? pkg.pricePerPerson * paidPeople : 0;
  const discountAmount = form.numberOfPeople >= 3 ? Math.round(packageAmountAfterFree * 0.20) : (freeTickets > 0 ? packageAmount - packageAmountAfterFree : 0);
  const effectivePackageAmount = freeTickets > 0 ? packageAmountAfterFree : packageAmount;
  const totalAmount = effectivePackageAmount + transportAmount - (form.numberOfPeople >= 3 && freeTickets === 0 ? discountAmount : 0);

  const transportIcon = (mode: string) => mode === 'FLIGHT' ? '✈️' : mode === 'TRAIN' ? '🚂' : '🚌';

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    if (!form.travelDate) { setFormError('Please select a travel date.'); return; }
    if (!form.numberOfPeople || form.numberOfPeople < 1) { setFormError('Please enter number of people.'); return; }
    setFormError('');
    setBookingLoading(true);
    try {
      const res = await api.post('/api/bookings', {
        packageId: id,
        travelDate: form.travelDate,
        numberOfPeople: form.numberOfPeople,
        departureLocationId: form.departureLocationId || undefined,
      });
      toast.success('Booking created! Proceeding to payment...');
      router.push(`/booking/${res.data.data.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <><Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    </>
  );

  if (!pkg) return <><Navbar /><div className="text-center py-20 text-gray-500">Package not found.</div></>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/packages" className="flex items-center gap-2 text-blue-600 hover:underline mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-72 bg-gradient-to-br from-blue-400 to-indigo-500 relative">
                  {pkg.imageUrl ? (
                    <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">🌍</div>
                  )}
                  <span className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    {pkg.category}
                  </span>
                </div>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{pkg.name}</h1>
                  <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-500" />{pkg.destination}, {pkg.state}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" />{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-500" />{pkg.availableSeats} seats available</span>
                    <span className="flex items-center gap-1"><Hotel className="w-4 h-4 text-blue-500" />{pkg.hotelCategory}</span>
                    <span className="flex items-center gap-1"><Utensils className="w-4 h-4 text-blue-500" />{pkg.mealsIncluded}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{pkg.description}</p>
                  <div className="mt-4 flex gap-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">🏨 {pkg.accommodation}</span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">📅 Best: {pkg.bestTimeToVisit}</span>
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Day-by-Day Itinerary</h2>
                <div className="space-y-3">
                  {pkg.itinerary.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">{line}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions / Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> Inclusions
                  </h2>
                  <ul className="space-y-2">
                    {pkg.inclusions.split('\n').map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-green-500">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" /> Exclusions
                  </h2>
                  <ul className="space-y-2">
                    {pkg.exclusions.split('\n').map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-red-400">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <h2 className="font-bold text-amber-800 mb-1">Cancellation Policy</h2>
                <p className="text-amber-700 text-sm">{pkg.cancellationPolicy}</p>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-600">₹{pkg.pricePerPerson.toLocaleString()}</div>
                  <p className="text-gray-400 text-sm">per person (package only)</p>
                </div>

                <form onSubmit={handleBook} className="space-y-4" noValidate>
                  {/* Travel Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Travel Date
                    </label>
                    <input type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.travelDate}
                      onChange={(e) => { setForm({ ...form, travelDate: e.target.value }); setFormError(''); }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  {/* Number of People */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Number of People
                    </label>
                    <input type="number" min={1} max={pkg.availableSeats}
                      value={form.numberOfPeople}
                      onChange={(e) => { setForm({ ...form, numberOfPeople: parseInt(e.target.value) || 1 }); setFormError(''); }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {form.numberOfPeople < 3 && (
                      <p className="text-xs text-blue-500 mt-1">💡 3+ people → 20% off | 🎟️ Every 4 tickets = 1 FREE!</p>
                    )}
                    {form.numberOfPeople >= 3 && form.numberOfPeople < 4 && (
                      <p className="text-xs text-green-600 mt-1 font-medium">🎉 20% group discount applied! Add 1 more for a free ticket!</p>
                    )}
                    {freeTickets > 0 && (
                      <p className="text-xs text-purple-600 mt-1 font-medium">🎟️ {freeTickets} FREE ticket{freeTickets > 1 ? 's' : ''} included! Pay for {paidPeople}, travel as {form.numberOfPeople}!</p>
                    )}
                  </div>

                  {/* Departure City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🏙️ Departure City (optional)
                    </label>
                    <select value={form.departureLocationId}
                      onChange={(e) => setForm({ ...form, departureLocationId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">-- Self arrangement --</option>
                      {departures.map((d) => (
                        <option key={d.id} value={d.id}>
                          {transportIcon(d.transportMode)} {d.departureCity} ({d.transportMode}) — +₹{d.transportPrice.toLocaleString()}/person
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Transport cost is added per person</p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 space-y-2 text-sm border border-blue-100 dark:border-blue-800">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Package (₹{pkg.pricePerPerson.toLocaleString()} × {form.numberOfPeople})</span>
                      <span>₹{packageAmount.toLocaleString()}</span>
                    </div>
                    {freeTickets > 0 && (
                      <div className="flex justify-between text-purple-600 font-medium">
                        <span>🎟️ {freeTickets} Free ticket{freeTickets > 1 ? 's' : ''} (4+1 offer)</span>
                        <span>-₹{(packageAmount - packageAmountAfterFree).toLocaleString()}</span>
                      </div>
                    )}
                    {form.numberOfPeople >= 3 && freeTickets === 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>🎉 Group Discount (20% off, 3+ people)</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedDeparture && (
                      <div className="flex justify-between text-gray-600">
                        <span>Transport ({selectedDeparture.departureCity} × {form.numberOfPeople})</span>
                        <span>₹{transportAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-blue-200 dark:border-blue-700 pt-2 flex justify-between font-bold text-gray-800 dark:text-white">
                      <span>Total</span>
                      <span className="text-blue-600 dark:text-blue-400 text-lg">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    {(discountAmount > 0 || freeTickets > 0) && (
                      <p className="text-green-600 dark:text-green-400 text-xs text-center font-medium">
                        You save ₹{(freeTickets > 0 ? packageAmount - packageAmountAfterFree : discountAmount).toLocaleString()}!
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500">Final price confirmed by server</p>
                  </div>

                  {formError && (
                    <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
                  )}

                  <button type="submit"
                    disabled={bookingLoading || pkg.availableSeats === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                    {pkg.availableSeats === 0 ? 'Sold Out' : bookingLoading ? 'Processing...' : 'Book Now'}
                  </button>
                  {!user && <p className="text-xs text-center text-gray-400">Login required to book.</p>}
                </form>

                {/* Quick info */}
                <div className="mt-4 pt-4 border-t space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-yellow-400" />{pkg.hotelCategory} accommodation</div>
                  <div className="flex items-center gap-2"><Utensils className="w-3.5 h-3.5 text-green-500" />{pkg.mealsIncluded}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-500" />Best time: {pkg.bestTimeToVisit}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
