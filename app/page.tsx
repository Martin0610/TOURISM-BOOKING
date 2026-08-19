'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { 
  Compass, Shield, CreditCard, Star, MapPin, Users, Clock, Phone, 
  Gift, Percent, Tag, Sparkles, ArrowRight, CheckCircle2, ChevronDown, 
  Plane, Heart, Flame, MessageCircle, Check, Calendar, Search, 
  Palmtree, Mountain, Landmark, Waves, Sun, Luggage, Trees
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import Image from 'next/image';
import toast from 'react-hot-toast';

const VIBE_OPTIONS = [
  { value: '', label: 'All Experiences', icon: Compass, color: 'text-blue-500' },
  { value: 'Beach', label: 'Beach Paradise', icon: Palmtree, color: 'text-amber-500' },
  { value: 'Hill Station', label: 'Hill Stations', icon: Mountain, color: 'text-cyan-500' },
  { value: 'Heritage', label: 'Royal Heritage', icon: Landmark, color: 'text-rose-500' },
  { value: 'Nature', label: 'Nature & Backwaters', icon: Trees, color: 'text-emerald-500' },
  { value: 'Adventure', label: 'Mountain Adventure', icon: Compass, color: 'text-indigo-500' },
  { value: 'Island', label: 'Island Getaway', icon: Waves, color: 'text-teal-500' },
  { value: 'Spiritual', label: 'Spiritual Journeys', icon: Sparkles, color: 'text-purple-500' },
];

const featuredDestinations = [
  {
    id: 'kashmir',
    name: 'Kashmir Paradise on Earth',
    state: 'Jammu & Kashmir',
    price: 31500,
    originalPrice: 36000,
    duration: '7D / 6N',
    category: 'Hill Station',
    rating: 4.9,
    reviewsCount: 148,
    image: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800',
    tag: 'Trending',
    highlights: ['Dal Lake Shikara', 'Gulmarg Gondola', 'Pahalgam Valley'],
  },
  {
    id: 'goa',
    name: 'Goa Beach Paradise',
    state: 'Goa',
    price: 15500,
    originalPrice: 19000,
    duration: '5D / 4N',
    category: 'Beach',
    rating: 4.8,
    reviewsCount: 230,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    tag: 'Best Seller',
    highlights: ['Water Sports', 'Old Goa Heritage', 'Dudhsagar Falls'],
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan Royal Heritage Tour',
    state: 'Rajasthan',
    price: 27800,
    originalPrice: 32000,
    duration: '7D / 6N',
    category: 'Heritage',
    rating: 4.9,
    reviewsCount: 194,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    tag: 'Top Rated',
    highlights: ['Amber Fort', 'Desert Camel Safari', 'Mehrangarh Fort'],
  },
];

const categoryVibes = [
  { name: 'Beach Paradise', count: '2 Packages', icon: Palmtree, color: 'from-cyan-500 to-blue-600', query: 'Beach' },
  { name: 'Hill Stations', count: '3 Packages', icon: Mountain, color: 'from-emerald-500 to-teal-600', query: 'Hill Station' },
  { name: 'Royal Heritage', count: '2 Packages', icon: Landmark, color: 'from-amber-500 to-orange-600', query: 'Heritage' },
  { name: 'Backwaters & Nature', count: '1 Package', icon: Waves, color: 'from-teal-500 to-emerald-700', query: 'Nature' },
  { name: 'Himalayan Adventure', count: '2 Packages', icon: Luggage, color: 'from-blue-600 to-indigo-700', query: 'Adventure' },
  { name: 'Island Getaway', count: '1 Package', icon: Sun, color: 'from-rose-500 to-pink-600', query: 'Island' },
];

const promoCoupons = [
  { code: 'TRIP1000', discount: '₹1,000 OFF', desc: 'On bookings over ₹20,000' },
  { code: 'EXPLORE500', discount: '₹500 OFF', desc: 'Flat discount on any package' },
  { code: 'FAMILY2026', discount: '10% OFF', desc: 'Exclusive for group bookings' },
];

const faqs = [
  {
    q: 'How does the 4+1 Free Ticket offer work?',
    a: 'When you book a package for 4 or more travelers, every 4th ticket is completely FREE on the package price! For example, 4 travelers pay for 3, and 8 travelers pay for 6. The discount is calculated automatically during booking.',
  },
  {
    q: 'What is the 20% Group Discount?',
    a: 'Book for 3 or more people, and you instantly unlock a flat 20% group discount on the package price. This lets friends and families travel together at an unbeatable price.',
  },
  {
    q: 'Can I choose my departure city and transport mode?',
    a: 'Yes! We support multi-city departures across India via Flights, Trains, and AC Buses. You can pick your preferred city at checkout or opt for self-arrangement if you already have tickets.',
  },
  {
    q: 'Can I customize an itinerary?',
    a: 'Absolutely! Click the WhatsApp button or call our travel experts directly at +91 72003 36447, and our concierge will tailor hotel tiers, extra destinations, and activities to your exact preferences.',
  },
  {
    q: 'What is your cancellation and refund policy?',
    a: 'Most packages offer free cancellation up to 7–10 days before the scheduled departure date. Refunds are processed swiftly within 5–7 business days to your original payment method.',
  },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // Search planner state
  const [searchDestination, setSearchDestination] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [vibeDropdownOpen, setVibeDropdownOpen] = useState(false);
  const vibeRef = useRef<HTMLDivElement>(null);
  const [travelersCount, setTravelersCount] = useState('1');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  
  // Promo Coupons
  const [coupons, setCoupons] = useState([
    { code: 'TRIP2026', discount: '20% OFF', desc: 'Auto applied on 3+ travelers' },
    { code: 'EXPLORE500', discount: '₹500 OFF', desc: 'Flat discount on any package' },
    { code: 'FAMILY2026', discount: '10% OFF', desc: 'Exclusive for group bookings' },
  ]);

  // Close vibe dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (vibeRef.current && !vibeRef.current.contains(event.target as Node)) {
        setVibeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    api.get('/api/coupons/available')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const fetched = res.data.data.map((c: { code: string; discountType: string; discountValue: number; minBookingAmount?: number }) => ({
            code: c.code,
            discount: c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue.toLocaleString()} OFF`,
            desc: c.minBookingAmount ? `Min booking ₹${c.minBookingAmount.toLocaleString()}` : 'Instant discount',
          }));
          setCoupons(fetched);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDestination.trim()) params.append('search', searchDestination.trim());
    if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
    router.push(`/packages?${params.toString()}`);
  };

  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      setSubscribing(true);
      const res = await api.post('/api/newsletter', { email: newsletterEmail });
      toast.success(res.data.message || 'Subscribed to VIP Club! 🎉');
      setNewsletterEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-4 overflow-hidden">
        {/* Background Visual & Ambient Glow */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1920&q=90"
            alt="Incredible India Tourism - Iconic Taj Mahal"
            className="w-full h-full object-cover object-center brightness-95 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/50 to-slate-950/90 backdrop-blur-[0.5px]" />
          
          {/* Glowing colorful radial spotlights for warm luxury tourism vibe */}
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center text-white pt-4">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-slate-800/60 backdrop-blur-xl border border-white/25 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium mb-6 shadow-lg shadow-black/20 animate-float">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-amber-200 font-semibold">10 Handpicked Indian Destinations</span>
            <span className="text-white/60">·</span>
            <span className="text-cyan-300 font-medium hidden sm:inline">Special 4+1 Free Offer</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6">
            Discover The Soul Of India,<br />
            <span className="bg-gradient-to-r from-cyan-300 via-amber-300 to-rose-400 bg-clip-text text-transparent">
              One Journey At A Time
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-200/90 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Premium curated tour packages with handpicked accommodations, flexible departures from any city, and transparent pricing.
          </p>

          {/* Dynamic Interactive Trip Planner Search Widget */}
          <div className="relative z-30 max-w-3xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-3.5 sm:p-4 rounded-3xl shadow-2xl shadow-black/40 border border-white/40 dark:border-slate-800 text-slate-900 dark:text-white mb-10">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Destination Input */}
              <div className="sm:col-span-5 text-left bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 focus-within:ring-2 focus-within:ring-blue-500 transition">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Where to?
                </label>
                <input
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="Goa, Kashmir, Manali, Kerala..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Category Picker with Custom Icon Dropdown */}
              <div ref={vibeRef} className="sm:col-span-4 text-left bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 transition relative z-40">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-500" /> Experience Vibe
                </label>
                <button
                  type="button"
                  onClick={() => setVibeDropdownOpen(!vibeDropdownOpen)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    {(() => {
                      const selected = VIBE_OPTIONS.find((o) => o.value === selectedCategory) || VIBE_OPTIONS[0];
                      const Icon = selected.icon;
                      return (
                        <>
                          <Icon className={`w-4 h-4 ${selected.color} flex-shrink-0`} />
                          <span className="truncate">{selected.label}</span>
                        </>
                      );
                    })()}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${vibeDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {vibeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700 py-1.5 z-50 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
                    {VIBE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = selectedCategory === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(opt.value);
                            setVibeDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between transition text-left cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-300 font-bold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${opt.color}`} />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full h-full min-h-[52px] bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Escapes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Floating Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto relative z-10">
            <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center">
              <div className="text-2xl font-black text-amber-300">4.9 ★</div>
              <div className="text-xs text-slate-200 mt-0.5 font-medium">2,500+ Happy Explorers</div>
            </div>
            <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center">
              <div className="text-2xl font-black text-cyan-300">4+1 FREE</div>
              <div className="text-xs text-slate-200 mt-0.5 font-medium">Group Ticket Offer</div>
            </div>
            <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center">
              <div className="text-2xl font-black text-emerald-300">20% OFF</div>
              <div className="text-xs text-slate-200 mt-0.5 font-medium">Groups of 3+ Pax</div>
            </div>
            <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center">
              <div className="text-2xl font-black text-rose-300">₹0 Fee</div>
              <div className="text-xs text-slate-200 mt-0.5 font-medium">Instant E-Confirmation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Offers & Live Coupon Display */}
      <section className="py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-center md:text-left">
            <span className="p-1.5 bg-amber-400 text-slate-950 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
              <Gift className="w-3.5 h-3.5" /> COUPONS
            </span>
            <span className="text-sm font-semibold">Check out these amazing coupons while booking:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="flex items-center gap-2 bg-white/15 border border-white/30 rounded-xl px-3.5 py-1.5 text-xs font-mono font-bold shadow-sm"
              >
                <Tag className="w-3.5 h-3.5 text-amber-300" />
                <span className="tracking-wide text-white font-black">{coupon.code}</span>
                <span className="text-amber-200 text-[11px] font-sans font-semibold">({coupon.discount})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Vibe Explorer */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
                <Compass className="w-4 h-4" /> Curated Experiences
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore By Travel Vibe
              </h2>
            </div>
            <Link
              href="/packages"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-cyan-400 hover:gap-2.5 transition-all"
            >
              Browse All 10 Packages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryVibes.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/packages?category=${encodeURIComponent(cat.query)}`}
                  className="group bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {cat.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3D Scroll Perspective Showcase */}
      <section className="bg-white dark:bg-slate-950 overflow-hidden py-10">
        <ContainerScroll
          titleComponent={
            <div className="mb-6">
              <span className="inline-block text-cyan-600 dark:text-cyan-400 font-bold text-sm tracking-wider uppercase mb-2">
                Unrivaled Beauty
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                India Is Waiting For You<br />
                <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Pack Your Bags Today
                </span>
              </h2>
            </div>
          }
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=85"
              alt="Incredible Taj Mahal India"
              height={720}
              width={1400}
              className="mx-auto rounded-2xl object-cover h-full w-full object-center group-hover:scale-105 transition-transform duration-700"
              draggable={false}
            />
            {/* Floating Tags inside the perspective view */}
            <div className="absolute top-6 left-6 bg-slate-950/70 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>UNESCO World Heritage Circuit</span>
            </div>
            <div className="absolute bottom-6 right-6 bg-emerald-600/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Verified Local Guides</span>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* Featured Packages Cards */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">
                <Flame className="w-4 h-4" /> Handpicked Escapes
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Top Trending Packages
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Our most sought-after itineraries with maximum customer satisfaction.
              </p>
            </div>
            <Link
              href="/packages"
              className="mt-4 md:mt-0 px-6 py-2.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              View All 10 Packages
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDestinations.map((pkg) => (
              <div
                key={pkg.name}
                className="group rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                {/* Image Cover */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {pkg.tag}
                  </span>
                  <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {pkg.rating} ({pkg.reviewsCount})
                  </span>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> {pkg.state}
                    </span>
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 text-cyan-300" /> {pkg.duration}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xl mb-3 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {pkg.name}
                    </h3>

                    {/* Highlights Checklist */}
                    <div className="space-y-1.5 mb-6">
                      {pkg.highlights.map((h) => (
                        <div key={h} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                          ₹{pkg.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{pkg.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        per person (all incl.)
                      </span>
                    </div>

                    <Link
                      href="/packages"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose TripEase (Bento Grid) */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              The TripEase Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Why 2,500+ Explorers Love Us
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">
              We remove the hassle from vacation planning with transparent pricing and curated excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 - Main Feature */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-6">
                  <Gift className="w-7 h-7 text-amber-300" />
                </div>
                <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">Unmatched Value</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 mb-3">
                  Book 4 Tickets, Get 1 FREE + 20% Group Savings
                </h3>
                <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
                  Travel is best enjoyed together. Our automatic discount engine calculates instant savings: 20% off for 3+ people and every 4th ticket is completely free!
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3 relative z-10">
                <Link
                  href="/packages"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition-transform hover:scale-105"
                >
                  View Eligible Packages
                </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Bento Card 2 - Departure flexibility */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5">
                  <Plane className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xl mb-2">
                  Multi-City Departures
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Fly from Mumbai, Delhi, Bangalore, or take a train from your home city. Transparent transit add-ons with zero hidden surcharges.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                <span>Flights · Trains · AC Buses</span>
              </div>
            </div>

            {/* Bento Card 3 - Razorpay Secure */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl mb-2">
                100% Secure Checkout
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Pay safely with UPI, Credit/Debit Cards, or Net Banking powered by Razorpay with 256-bit encryption.
              </p>
            </div>

            {/* Bento Card 4 - WhatsApp Concierge */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center mb-5">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl mb-2">
                24/7 WhatsApp Support
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Need to tweak your schedule or request hotel upgrades? Our direct WhatsApp desk is always ready to assist.
              </p>
            </div>

            {/* Bento Card 5 - Handcrafted Itinerary */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl mb-2">
                Curated Premium Stays
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Every hotel, houseboat, and resort is personally vetted for safety, cleanliness, breakfast inclusions, and prime location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step How It Works Stepper */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 mb-4">
            How Your Dream Vacation Begins
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto mb-16">
            From discovering your destination to getting your boarding pass, we make every step seamless.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { step: '01', title: 'Pick Destination', desc: 'Browse 10 handpicked itineraries by beach, mountain, or heritage.', icon: Compass, color: 'text-cyan-500' },
              { step: '02', title: 'Choose Departure', desc: 'Select travel date, passenger count, and your local departure city.', icon: Calendar, color: 'text-blue-500' },
              { step: '03', title: 'Apply Discounts', desc: 'Get automatic 20% group cuts, 4+1 free tickets, and coupon codes.', icon: Tag, color: 'text-amber-500' },
              { step: '04', title: 'Instant Booking', desc: 'Complete secure payment and receive your digital travel voucher.', icon: CheckCircle2, color: 'text-emerald-500' },
            ].map(({ step, title, desc, icon: Icon, color }, i) => (
              <div
                key={step}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative text-left group"
              >
                <div className="text-5xl font-black text-slate-100 dark:text-slate-700/60 absolute top-4 right-4 select-none">
                  {step}
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traveler Reviews & Testimonials */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
              Real Explorer Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Loved By Travelers Across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Priya & Rahul Sharma',
                loc: 'Traveled to Kashmir (7D/6N)',
                text: 'The houseboat on Dal Lake and the Gulmarg gondola ride were breathtaking! Booking was instant, and the 20% group discount for our family made it unbeatable.',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              },
              {
                name: 'Aditya Verma & Friends',
                loc: 'Traveled to Goa (5D/4N)',
                text: 'We were a group of 5 and unlocked the 4+1 FREE ticket offer! Saved over ₹15,000 on our trip. Hotel was beach-facing with great food and zero hassles.',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              },
              {
                name: 'Meera Krishnan',
                loc: 'Traveled to Rajasthan Heritage',
                text: 'The heritage havelis and the camel safari in Jaisalmer were out of this world. TripEase customer support helped us with train departure from Chennai seamlessly.',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-400">{t.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-800 dark:text-white text-sm sm:text-base hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85"
            alt="Scenic Beach Getaway"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-indigo-950/85 to-purple-950/90 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            Limited Time Offers
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Ready To Start Your Next Adventure?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto mb-8 font-light">
            Join thousands of smart travelers who book hassle-free tours with TripEase.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/packages"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white font-extrabold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-orange-500/30 text-base"
            >
              Explore All Packages
            </Link>
            <Link
              href={user ? "/my-bookings" : "/register"}
              className="w-full sm:w-auto bg-white/15 backdrop-blur-md border border-white/40 text-white font-bold px-8 py-4 rounded-full hover:bg-white/25 transition-all text-base"
            >
              {user ? "View My Bookings" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>

      {/* Vibrant Modern Footer */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Col 1: Brand info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-2xl text-white tracking-tight">
                  TripEase
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                India's premier travel booking engine. Offering curated vacation packages with multi-city departures, group savings, and instant digital vouchers.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-400" /> Razorpay Verified</span>
                <span className="flex items-center gap-1"><CreditCard className="w-4 h-4 text-cyan-400" /> UPI & NetBanking</span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                <li><Link href="/packages" className="hover:text-white transition">Tourism Packages</Link></li>
                <li><Link href="/wishlist" className="hover:text-white transition">Saved Wishlist</Link></li>
                <li><Link href="/my-bookings" className="hover:text-white transition">My Bookings</Link></li>
              </ul>
            </div>

            {/* Col 3: Popular Escapes */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Popular Escapes</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/packages?category=Beach" className="hover:text-white transition">Goa & Andamans</Link></li>
                <li><Link href="/packages?category=Hill+Station" className="hover:text-white transition">Kashmir & Manali</Link></li>
                <li><Link href="/packages?category=Heritage" className="hover:text-white transition">Rajasthan Royal Tour</Link></li>
                <li><Link href="/packages?category=Nature" className="hover:text-white transition">Kerala Backwaters</Link></li>
              </ul>
            </div>

            {/* Col 4: VIP Club Application / Contact */}
            <div>
              <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> VIP Travel Club
              </h4>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Apply for VIP Club status to unlock secret flash sales & tier discounts. Approved by admin based on your travel history.
              </p>
              <form onSubmit={handleNewsletter} className="flex gap-1.5">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your account email..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={subscribing || !newsletterEmail}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  {subscribing ? 'Applying...' : 'Apply VIP'}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1 text-xs">
                <a href="tel:+917200336447" className="flex items-center gap-1.5 text-cyan-400 hover:underline">
                  <Phone className="w-3.5 h-3.5" /> +91 72003 36447
                </a>
                <p className="text-slate-500">mjv3140@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 TripEase Holidays Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/packages" className="hover:text-slate-400 transition">Terms of Service</Link>
              <Link href="/packages" className="hover:text-slate-400 transition">Privacy Policy</Link>
              <Link href="/packages" className="hover:text-slate-400 transition">Cancellation Guarantee</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
