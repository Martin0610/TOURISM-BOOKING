'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Package, DepartureLocation } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Clock, Users, Calendar, ArrowLeft, Hotel, Utensils, CheckCircle, XCircle, Star, Heart, Tag, Plane, Train, Bus, Globe, PartyPopper, Phone } from 'lucide-react';
import Link from 'next/link';
import WhatsAppButton from '@/components/WhatsAppButton';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name: string };
}

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
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ discountAmount: number; code: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<{
    id: string; code: string; discountType: string; discountValue: number;
    minBookingAmount: number; expiresAt: string;
  }[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkgRes = await api.get(`/api/packages/${id}`);
        const p: Package = pkgRes.data.data;
        setPkg(p);
        const [depRes, reviewRes, couponRes] = await Promise.all([
          api.get(`/api/departures?destination=${encodeURIComponent(p.destination)}`),
          api.get(`/api/reviews/package/${id}`),
          api.get('/api/coupons/available'),
        ]);
        setDepartures(depRes.data.data);
        setReviews(reviewRes.data.data.reviews);
        setAvgRating(reviewRes.data.data.avgRating);
        setAvailableCoupons(couponRes.data.data);
        // Check wishlist if logged in
        if (localStorage.getItem('token')) {
          try {
            const wRes = await api.get('/api/wishlist');
            const inList = wRes.data.data.some((w: { packageId: string }) => w.packageId === id);
            setIsWishlisted(inList);
          } catch { /* not logged in */ }
        }
      } catch {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleWishlist = async () => {
    if (!user) { router.push('/login'); return; }
    try {
      if (isWishlisted) {
        await api.delete(`/api/wishlist/${id}`);
        setIsWishlisted(false);
      } else {
        await api.post('/api/wishlist', { packageId: id });
        setIsWishlisted(true);
      }
    } catch { /* ignore */ }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const subtotal = effectivePackageAmount + transportAmount - (form.numberOfPeople >= 3 && freeTickets === 0 ? discountAmount : 0);
      const res = await api.post('/api/coupons/validate', { code: couponCode.trim(), bookingAmount: subtotal });
      setCouponResult(res.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Invalid coupon');
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const selectedDeparture = departures.find((d) => d.id === form.departureLocationId);
  const packageAmount = pkg ? pkg.pricePerPerson * form.numberOfPeople : 0;
  const transportAmount = selectedDeparture ? selectedDeparture.transportPrice * form.numberOfPeople : 0;
  const freeTickets = form.numberOfPeople >= 4 ? Math.floor(form.numberOfPeople / 4) : 0;
  const paidPeople = form.numberOfPeople - freeTickets;
  const packageAmountAfterFree = pkg ? pkg.pricePerPerson * paidPeople : 0;
  const discountAmount = form.numberOfPeople >= 3 ? Math.round(packageAmountAfterFree * 0.20) : (freeTickets > 0 ? packageAmount - packageAmountAfterFree : 0);
  const effectivePackageAmount = freeTickets > 0 ? packageAmountAfterFree : packageAmount;
  const subtotalBeforeCoupon = effectivePackageAmount + transportAmount - (form.numberOfPeople >= 3 && freeTickets === 0 ? discountAmount : 0);
  const couponDiscount = couponResult?.discountAmount ?? 0;
  const totalAmount = subtotalBeforeCoupon - couponDiscount;

  const transportLabel = (mode: string) => {
    if (mode === 'FLIGHT') return '✈️';
    if (mode === 'TRAIN') return '🚂';
    return '🚌';
  };

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
        couponCode: couponResult?.code || undefined,
      });
      router.push(`/booking/${res.data.data.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Booking failed');
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
      <WhatsAppButton />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/packages" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg mb-6 text-sm font-medium transition inline-flex">
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-72 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 relative">
                  {pkg.imageUrl ? (
                    <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Globe className="w-24 h-24" />
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    {pkg.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">{pkg.name}</h1>
                    <button onClick={handleWishlist}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ml-3 flex-shrink-0 ${isWishlisted ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}>
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      {isWishlisted ? 'Saved' : 'Save'}
                    </button>
                  </div>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                      <span className="text-sm text-gray-500 ml-1">{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-pink-500" />{pkg.destination}, {pkg.state}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-purple-500" />{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4 text-teal-500" />{pkg.availableSeats} seats available</span>
                    <span className="flex items-center gap-1"><Hotel className="w-4 h-4 text-orange-500" />{pkg.hotelCategory}</span>
                    <span className="flex items-center gap-1"><Utensils className="w-4 h-4 text-green-500" />{pkg.mealsIncluded}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{pkg.description}</p>
                  <div className="mt-4 flex gap-4 text-sm">
                    <span className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
                      <Hotel className="w-3 h-3" /> {pkg.accommodation}
                    </span>
                    <span className="bg-gradient-to-r from-green-50 to-teal-50 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Best: {pkg.bestTimeToVisit}
                    </span>
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

              {/* Custom Package Inquiry */}
              <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:bg-gradient-to-r dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3 flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">Need a Custom Package?</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Want to modify this itinerary, add extra destinations, or create a personalized plan? Our travel experts are here to help!
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {/* Mobile: Call button */}
                      <a href="tel:+917200336447" 
                        className="md:hidden inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-sm">
                        <Phone className="w-4 h-4" />
                        Call +91 72003 36447
                      </a>
                      
                      {/* Desktop: WhatsApp & Copy */}
                      <a href="https://wa.me/917200336447?text=Hi!%20I'm%20interested%20in%20customizing%20the%20package:%20" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:inline-flex items-center gap-2 bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp Us
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('+917200336447');
                          alert('Phone number copied: +91 72003 36447');
                        }}
                        className="hidden md:inline-flex items-center gap-2 bg-gray-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-700 transition text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Number
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Reviews
                    {avgRating > 0 && <span className="text-base font-normal text-gray-500">({avgRating}/5 · {reviews.length})</span>}
                  </h2>
                </div>
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800 text-sm">{r.user.name}</span>
                          <div className="flex">
                            {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                          </div>
                        </div>
                        {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                        <p className="text-gray-400 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                      <p className="text-xs text-purple-500 mt-1">💡 3+ people → 20% off | 🎟️ Every 4 tickets = 1 FREE!</p>
                    )}
                    {form.numberOfPeople >= 3 && form.numberOfPeople < 4 && (
                      <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                        <PartyPopper className="w-3 h-3" /> 20% group discount applied! Add 1 more for a free ticket!
                      </p>
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
                          {transportLabel(d.transportMode)} {d.departureCity} ({d.transportMode}) — +₹{d.transportPrice.toLocaleString()}/person
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Transport cost is added per person</p>
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Tag className="w-4 h-4" /> Coupon Code
                    </label>

                    {/* Available coupons */}
                    {availableCoupons.length > 0 && (
                      <div className="mb-2">
                        <button type="button" onClick={() => setShowCoupons(!showCoupons)}
                          className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                          🎟️ {availableCoupons.length} coupon{availableCoupons.length > 1 ? 's' : ''} available — tap to view
                        </button>
                        {showCoupons && (
                          <div className="mt-2 space-y-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border-2 border-purple-100">
                            {availableCoupons.map(c => {
                              const eligible = subtotalBeforeCoupon >= c.minBookingAmount;
                              return (
                                <div key={c.id}
                                  onClick={() => {
                                    if (eligible) {
                                      setCouponCode(c.code);
                                      setCouponResult(null);
                                      setShowCoupons(false);
                                    }
                                  }}
                                  className={`flex items-center justify-between rounded-lg px-3 py-2 ${eligible ? 'cursor-pointer hover:bg-purple-100 bg-white border-2 border-purple-200' : 'bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed'}`}>
                                  <div>
                                    <span className="font-mono font-bold text-purple-700 text-sm">{c.code}</span>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                                      {c.minBookingAmount > 0 && ` · Min ₹${c.minBookingAmount.toLocaleString('en-IN')}`}
                                    </p>
                                    {!eligible && <p className="text-xs text-red-400">Need ₹{c.minBookingAmount.toLocaleString('en-IN')} min</p>}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    Expires {new Date(c.expiresAt).toLocaleDateString('en-IN')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
                        placeholder="Enter or select coupon code"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                        className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-3 py-2 rounded-lg text-sm hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition">
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponResult && (
                      <p className="text-green-600 text-xs mt-1 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {couponResult.code} — ₹{couponResult.discountAmount.toLocaleString('en-IN')} off!
                      </p>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:bg-gradient-to-r dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl p-4 space-y-2 text-sm border-2 border-purple-100 dark:border-gray-700">
                    <div className="flex justify-between text-gray-700 dark:text-gray-200">
                      <span>Package (₹{pkg.pricePerPerson.toLocaleString()} × {form.numberOfPeople})</span>
                      <span>₹{packageAmount.toLocaleString()}</span>
                    </div>
                    {freeTickets > 0 && (
                      <div className="flex justify-between text-purple-600 dark:text-purple-300 font-medium">
                        <span>🎟️ {freeTickets} Free ticket{freeTickets > 1 ? 's' : ''} (4+1 offer)</span>
                        <span>-₹{(packageAmount - packageAmountAfterFree).toLocaleString()}</span>
                      </div>
                    )}
                    {form.numberOfPeople >= 3 && freeTickets === 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-300 font-medium">
                        <span className="flex items-center gap-1">
                          <PartyPopper className="w-4 h-4" /> Group Discount (20% off, 3+ people)
                        </span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedDeparture && (
                      <div className="flex justify-between text-gray-700 dark:text-gray-200">
                        <span>Transport ({selectedDeparture.departureCity} × {form.numberOfPeople})</span>
                        <span>₹{transportAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-purple-600 dark:text-purple-300 font-medium">
                        <span>🎟️ Coupon ({couponResult?.code})</span>
                        <span>-₹{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-purple-200 dark:border-gray-600 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:text-purple-300 text-lg">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    {(discountAmount > 0 || freeTickets > 0) && (
                      <p className="text-green-600 dark:text-green-300 text-xs text-center font-medium">
                        You save ₹{(freeTickets > 0 ? packageAmount - packageAmountAfterFree : discountAmount).toLocaleString()}!
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Final price confirmed by server</p>
                  </div>

                  {formError && (
                    <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
                  )}

                  <button type="submit"
                    disabled={bookingLoading || pkg.availableSeats === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-60">
                    {pkg.availableSeats === 0 ? 'Sold Out' : bookingLoading ? 'Processing...' : 'Book Now'}
                  </button>
                  {!user && <p className="text-xs text-center text-gray-400">Login required to book.</p>}
                </form>

                {/* Quick info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-yellow-400" />{pkg.hotelCategory} accommodation</div>
                  <div className="flex items-center gap-2"><Utensils className="w-3.5 h-3.5 text-green-500" />Breakfast & Dinner included</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-pink-500" />Best time: {pkg.bestTimeToVisit}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
