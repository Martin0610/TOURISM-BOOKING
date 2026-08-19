'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Package, DepartureLocation } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { 
  MapPin, Clock, Users, Calendar, ArrowLeft, Hotel, Utensils, 
  CheckCircle2, XCircle, Star, Heart, Tag, Plane, Train, Bus, 
  Globe, PartyPopper, Phone, Copy, Sparkles, ShieldCheck, 
  ChevronRight, MessageCircle, AlertCircle, Check, Gift
} from 'lucide-react';
import Link from 'next/link';
import WhatsAppButton from '@/components/WhatsAppButton';
import Footer from '@/components/Footer';

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
  const { user, loading: authLoading } = useAuth();
  
  const [pkg, setPkg] = useState<Package | null>(null);
  const [departures, setDepartures] = useState<DepartureLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Redirect unsigned users to login with redirect back to this package
  useEffect(() => {
    if (!authLoading && !user && typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push(`/login?redirect=/packages/${id}`);
      return;
    }
  }, [user, authLoading, id, router]);
  
  // Booking Form State
  const [form, setForm] = useState({ 
    travelDate: '', 
    numberOfPeople: 1, 
    departureLocationId: '', 
    phone: '' 
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ discountAmount: number; code: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<{
    id: string; code: string; discountType: string; discountValue: number;
    minBookingAmount: number; expiresAt: string;
  }[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);

  // Wishlist & Reviews
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'inclusions' | 'reviews' | 'policies'>('overview');

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
        
        setDepartures(depRes.data.data || []);
        setReviews(reviewRes.data.data?.reviews || []);
        setAvgRating(reviewRes.data.data?.avgRating || 0);
        setAvailableCoupons(couponRes.data.data || []);

        // Check wishlist
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
    if (!user) {
      toast.error('Please login to save to wishlist');
      router.push(`/login?redirect=/packages/${id}`);
      return;
    }
    try {
      if (isWishlisted) {
        await api.delete(`/api/wishlist/${id}`);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/api/wishlist', { packageId: id });
        setIsWishlisted(true);
        toast.success('Saved to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Package link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculations
  const selectedDeparture = departures.find((d) => d.id === form.departureLocationId);
  const packageAmount = pkg ? pkg.pricePerPerson * form.numberOfPeople : 0;
  const transportAmount = selectedDeparture ? selectedDeparture.transportPrice * form.numberOfPeople : 0;
  
  // 4+1 free ticket calculation
  const freeTickets = form.numberOfPeople >= 4 ? Math.floor(form.numberOfPeople / 4) : 0;
  const paidPeople = form.numberOfPeople - freeTickets;
  const packageAmountAfterFree = pkg ? pkg.pricePerPerson * paidPeople : 0;
  
  // 20% Group discount (only if 3 people and freeTickets is 0)
  const isGroupDiscount = form.numberOfPeople >= 3 && freeTickets === 0;
  const discountAmount = isGroupDiscount 
    ? Math.round(packageAmount * 0.20) 
    : (freeTickets > 0 ? packageAmount - packageAmountAfterFree : 0);

  const effectivePackageAmount = freeTickets > 0 
    ? packageAmountAfterFree 
    : (isGroupDiscount ? packageAmount - discountAmount : packageAmount);

  const subtotalBeforeCoupon = effectivePackageAmount + transportAmount;
  const couponDiscount = couponResult?.discountAmount ?? 0;
  const totalAmount = Math.max(0, subtotalBeforeCoupon - couponDiscount);
  const totalSavings = (packageAmount - effectivePackageAmount) + couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/api/coupons/validate', { 
        code: couponCode.trim().toUpperCase(), 
        bookingAmount: subtotalBeforeCoupon 
      });
      setCouponResult(res.data.data);
      toast.success(`Coupon ${res.data.data.code} applied successfully!`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Invalid or expired coupon');
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const transportLabel = (mode: string) => {
    if (mode === 'FLIGHT') return '✈️ Flight';
    if (mode === 'TRAIN') return '🚆 Train';
    return '🚌 AC Bus';
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to proceed with booking');
      router.push('/login');
      return;
    }
    if (!form.travelDate) {
      setFormError('Please select a travel date.');
      return;
    }
    if (!form.numberOfPeople || form.numberOfPeople < 1) {
      setFormError('Please specify at least 1 traveler.');
      return;
    }
    if (!form.phone) {
      setFormError('Please enter your 10-digit phone number.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setFormError('Phone number must be exactly 10 digits.');
      return;
    }
    setFormError('');
    setBookingLoading(true);

    try {
      const res = await api.post('/api/bookings', {
        packageId: id,
        travelDate: form.travelDate,
        numberOfPeople: form.numberOfPeople,
        departureLocationId: form.departureLocationId || undefined,
        couponCode: couponResult?.code || undefined,
        phone: form.phone,
      });
      toast.success('Booking initialized!');
      router.push(`/booking/${res.data.data.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Booking failed. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading dream package details...</p>
        </div>
      </>
    );
  }

  if (!pkg) {
    return (
      <>
        <Navbar />
        <div className="text-center py-32 px-4 max-w-md mx-auto">
          <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-float" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Package Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">The vacation package you are looking for might have expired or been relocated.</p>
          <Link href="/packages" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-full transition">
            Explore All Packages
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-16">
          {/* Breadcrumb / Back Link */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Packages
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 shadow-sm transition cursor-pointer"
                title="Copy package link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              {user?.role !== 'ADMIN' && (
                <button
                  onClick={handleWishlist}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border shadow-sm transition cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2 Cols): Visual Media, Tabs & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photographic Hero Cover */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  {pkg.imageUrl ? (
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Globe className="w-24 h-24" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

                  {/* Badges on Hero */}
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold px-3.5 py-1 rounded-full shadow-lg">
                    {pkg.category} Experience
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md">
                      {pkg.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-400" /> {pkg.destination}, {pkg.state}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-cyan-300" /> {pkg.durationDays} Days / {pkg.durationNights} Nights
                      </span>
                      {avgRating > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 bg-amber-400/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-amber-300 border border-amber-300/30">
                            <Star className="w-3.5 h-3.5 fill-amber-300" /> {avgRating} ({reviews.length} reviews)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Quick Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50/50 dark:bg-slate-850/50 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Hotel Category</span>
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5 text-amber-500" /> {pkg.hotelCategory}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Meals Included</span>
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-emerald-500" /> {pkg.mealsIncluded}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Best Season</span>
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500" /> {pkg.bestTimeToVisit}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Availability</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {pkg.availableSeats} Seats Left
                    </span>
                  </div>
                </div>
              </div>

              {/* Modern Interactive Section Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto no-scrollbar">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'itinerary', label: 'Day-by-Day Itinerary' },
                  { key: 'inclusions', label: 'Inclusions & Exclusions' },
                  { key: 'policies', label: 'Cancellation Policy' },
                  { key: 'reviews', label: `Reviews (${reviews.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                      activeTab === tab.key
                        ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trip Summary</h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {pkg.description}
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                      <span className="text-xs text-slate-400 block mb-1 font-semibold">Stay Details</span>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{pkg.accommodation}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                      <span className="text-xs text-slate-400 block mb-1 font-semibold">Sightseeing & Guides</span>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        {pkg.sightseeingIncluded ? 'Full Sightseeing with Dedicated Guide' : 'Self-guided activities'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Detailed Itinerary */}
              {activeTab === 'itinerary' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Complete Day-by-Day Schedule</h2>
                  
                  <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-blue-200 dark:before:bg-slate-700">
                    {pkg.itinerary.split('\n').filter(Boolean).map((dayText, i) => {
                      const [dayHeader, ...dayDescParts] = dayText.split(':');
                      const dayDesc = dayDescParts.join(':');

                      return (
                        <div key={i} className="flex items-start gap-4 relative">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0 shadow-md shadow-blue-500/30 ring-4 ring-white dark:ring-slate-900">
                            {i + 1}
                          </div>
                          <div className="flex-1 bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                              {dayHeader.trim()}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {dayDesc ? dayDesc.trim() : dayText}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Inclusions vs Exclusions */}
              {activeTab === 'inclusions' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-base mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> What&apos;s Included
                    </h3>
                    <ul className="space-y-3">
                      {pkg.inclusions.split('\n').filter(Boolean).map((item, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-rose-600 dark:text-rose-400 text-base mb-4 flex items-center gap-2">
                      <XCircle className="w-5 h-5" /> What&apos;s Excluded
                    </h3>
                    <ul className="space-y-3">
                      {pkg.exclusions.split('\n').filter(Boolean).map((item, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 4: Policies */}
              {activeTab === 'policies' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-500" /> Cancellation & Refund Rules
                  </h3>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    {pkg.cancellationPolicy}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All refunds are credited automatically back to the original source within 5–7 business days. For emergency rescheduling, connect with our support desk.
                  </p>
                </div>
              )}

              {/* Tab 5: Reviews */}
              {activeTab === 'reviews' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Traveler Reviews
                    </h3>
                    {avgRating > 0 && (
                      <span className="text-xs font-semibold text-slate-500">
                        Average: {avgRating} / 5.0
                      </span>
                    )}
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      No reviews yet for this itinerary. Book and be the first to share your journey!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((r) => (
                        <div key={r.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{r.user.name}</span>
                            <div className="flex">
                              {[1,2,3,4,5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {r.comment && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{r.comment}</p>
                          )}
                          <span className="text-[10px] text-slate-400 block mt-2">
                            Reviewed on {new Date(r.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Package / Concierge Help Card */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Custom Itineraries</span>
                    <h3 className="text-lg font-bold mt-1">Want custom hotels or private transport?</h3>
                    <p className="text-xs text-slate-300 max-w-md mt-1">
                      Our destination specialists can adjust stays, add extra nights, and arrange private transfers on WhatsApp.
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <a
                      href="https://wa.me/917200336447?text=Hi!%20I'm%20interested%20in%20customizing%20the%20package:%20"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp Us
                    </a>
                    <a
                      href="tel:+917200336447"
                      className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 border border-white/20 transition"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Expert
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Real-time Sticky Booking Calculator */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 sticky top-24 space-y-5">
                {/* Price Display */}
                <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                      ₹{pkg.pricePerPerson.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 block font-medium">per person / package</span>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Best Price Match
                  </span>
                </div>

                {user?.role === 'ADMIN' ? (
                  /* Admin Preview & Management Hub */
                  <div className="space-y-4 pt-1">
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-cyan-300 mb-1">
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        <span>Administrator Preview Mode</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        You are viewing this package with administrator privileges. User checkout is disabled for admin accounts.
                      </p>
                    </div>

                    {/* Live Package Stats Grid */}
                    <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Inventory Capacity</span>
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-500" /> {pkg.availableSeats} Seats Left
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Hotel Tier</span>
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Hotel className="w-3.5 h-3.5 text-amber-500" /> {pkg.hotelCategory}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Departure Transit</span>
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Plane className="w-3.5 h-3.5 text-cyan-500" /> {departures.length} Routes Configured
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Customer Rating</span>
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {avgRating > 0 ? `${avgRating} (${reviews.length} reviews)` : 'No reviews yet'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="font-medium">Experience Vibe</span>
                        <span className="font-bold text-blue-600 dark:text-cyan-400">
                          {pkg.category}
                        </span>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="space-y-2 pt-1">
                      <Link
                        href="/admin/packages"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" /> Manage Packages in Admin
                      </Link>

                      <Link
                        href="/admin/bookings"
                        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      >
                        <span>View All Bookings</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <p className="text-[11px] text-center text-slate-400">
                      Sign in with a customer account to test passenger checkout.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBook} className="space-y-4" noValidate>
                    {/* Travel Date Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" /> Travel Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={form.travelDate}
                        onChange={(e) => {
                          setForm({ ...form, travelDate: e.target.value });
                          setFormError('');
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Number of Travelers Stepper */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-500" /> Travelers Count
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={pkg.availableSeats}
                        value={form.numberOfPeople}
                        onChange={(e) => {
                          setForm({ ...form, numberOfPeople: parseInt(e.target.value) || 1 });
                          setFormError('');
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {/* Dynamic Celebration Discount Banners */}
                      {form.numberOfPeople === 3 && (
                        <div className="mt-2 p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                          <PartyPopper className="w-4 h-4 text-emerald-500 animate-bounce" />
                          <span>20% Group Discount unlocked! Add 1 more for 4+1 FREE!</span>
                        </div>
                      )}

                      {freeTickets > 0 && (
                        <div className="mt-2 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                          <Gift className="w-4 h-4 text-amber-500 animate-bounce" />
                          <span>{freeTickets} FREE Ticket{freeTickets > 1 ? 's' : ''} included! Pay for {paidPeople} only!</span>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-rose-500" /> Phone Number (10 Digits)
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setForm({ ...form, phone: val });
                          setFormError('');
                        }}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wide"
                      />
                    </div>

                    {/* Departure Location / Transit Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Departure City Transit (Optional)
                      </label>
                      <select
                        value={form.departureLocationId}
                        onChange={(e) => setForm({ ...form, departureLocationId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">-- Self Arrangement (No Transport) --</option>
                        {departures.map((d) => (
                          <option key={d.id} value={d.id}>
                            {transportLabel(d.transportMode)}: {d.departureCity} (+₹{d.transportPrice.toLocaleString()}/person)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Promo Coupon Input & Modal Trigger */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-amber-500" /> Apply Coupon
                        </label>
                        {availableCoupons.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowCoupons(!showCoupons)}
                            className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                          >
                            {showCoupons ? 'Hide Coupons' : `View ${availableCoupons.length} Coupons`}
                          </button>
                        )}
                      </div>

                      {showCoupons && (
                        <div className="mb-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 max-h-48 overflow-y-auto">
                          {availableCoupons.map((c) => {
                            const eligible = subtotalBeforeCoupon >= c.minBookingAmount;
                            return (
                              <div
                                key={c.id}
                                onClick={() => {
                                  if (eligible) {
                                    setCouponCode(c.code);
                                    setCouponResult(null);
                                    setShowCoupons(false);
                                  }
                                }}
                                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                                  eligible
                                    ? 'bg-white dark:bg-slate-700/80 border-blue-200 dark:border-slate-600 cursor-pointer hover:border-blue-500'
                                    : 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
                                }`}
                              >
                                <div>
                                  <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">{c.code}</span>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                                    {c.minBookingAmount > 0 && ` (Min ₹${c.minBookingAmount.toLocaleString()})`}
                                  </p>
                                </div>
                                <span className="text-[10px] text-slate-400">Tap to use</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponResult(null);
                          }}
                          placeholder="ENTER CODE"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition cursor-pointer"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>

                      {couponResult && (
                        <p className="text-emerald-600 text-xs mt-1.5 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Coupon {couponResult.code} applied: -₹{couponResult.discountAmount.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Dynamic Cost Breakdown */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Package (₹{pkg.pricePerPerson.toLocaleString()} × {form.numberOfPeople})</span>
                        <span>₹{packageAmount.toLocaleString()}</span>
                      </div>

                      {freeTickets > 0 && (
                        <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                          <span>4+1 Free Ticket ({freeTickets} pax)</span>
                          <span>-₹{(packageAmount - packageAmountAfterFree).toLocaleString()}</span>
                        </div>
                      )}

                      {isGroupDiscount && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>Group Discount (20%)</span>
                          <span>-₹{discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      {selectedDeparture && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Transit ({selectedDeparture.departureCity} × {form.numberOfPeople})</span>
                          <span>+₹{transportAmount.toLocaleString()}</span>
                        </div>
                      )}

                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>Coupon Discount</span>
                          <span>-₹{couponDiscount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline font-bold text-sm text-slate-900 dark:text-white">
                        <span>Final Total:</span>
                        <span className="text-xl font-black text-blue-600 dark:text-cyan-400">
                          ₹{totalAmount.toLocaleString()}
                        </span>
                      </div>

                      {totalSavings > 0 && (
                        <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold text-center pt-1">
                          Total Savings: ₹{totalSavings.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {formError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bookingLoading || pkg.availableSeats === 0}
                      className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {pkg.availableSeats === 0
                        ? 'Sold Out'
                        : bookingLoading
                        ? 'Confirming Booking...'
                        : 'Proceed to Checkout'}
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {!user && (
                      <p className="text-[11px] text-center text-slate-400">
                        You will be redirected to sign in before finalizing.
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
