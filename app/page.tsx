'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { 
  Compass, Shield, CreditCard, Star, MapPin, Users, Clock, Phone, 
  Gift, Percent, Tag, Sparkles, ArrowRight, CheckCircle2, ChevronDown, 
  Plane, Heart, Flame, MessageCircle, Check, Calendar, Search, 
  Palmtree, Mountain, Landmark, Waves, Sun, Luggage, Trees, ShieldCheck, Crown, Hotel, Copy
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Package } from '@/lib/types';
import Footer from '@/components/Footer';
import { getAuthToken } from '@/lib/authStorage';

const VIBE_OPTIONS = [
  { value: '', label: 'All Experiences', icon: Compass, color: 'text-blue-500' },
  { value: 'Beach', label: 'Beach Paradise', icon: Palmtree, color: 'text-amber-500' },
  { value: 'Hill Station', label: 'Hill Stations', icon: Mountain, color: 'text-sky-500' },
  { value: 'Heritage', label: 'Royal Heritage', icon: Landmark, color: 'text-rose-500' },
  { value: 'Nature', label: 'Nature & Backwaters', icon: Trees, color: 'text-emerald-500' },
  { value: 'Adventure', label: 'Mountain Adventure', icon: Compass, color: 'text-blue-500' },
  { value: 'Island', label: 'Island Getaway', icon: Waves, color: 'text-teal-500' },
  { value: 'Spiritual', label: 'Spiritual Journeys', icon: Sparkles, color: 'text-amber-500' },
];

const HERO_THEMES = [
  {
    id: 'beach',
    name: 'Goa Coastal',
    tag: 'Azure Waters & Sun',
    icon: Palmtree,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=90',
    titleAccent: 'from-sky-300 via-cyan-200 to-blue-300',
    glowColor: 'bg-blue-500/10',
    buttonGrad: 'bg-blue-600 hover:bg-blue-700',
    bgGrad: 'from-[#021B2B] via-[#06334F] to-[#02131F]',
    badgeColor: 'border-sky-300/40 text-sky-200',
  },
  {
    id: 'snow',
    name: 'Kashmir Valleys',
    tag: 'Himalayan Snow Peaks',
    icon: Mountain,
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1920&q=90',
    titleAccent: 'from-sky-200 via-blue-200 to-cyan-300',
    glowColor: 'bg-blue-500/10',
    buttonGrad: 'bg-blue-600 hover:bg-blue-700',
    bgGrad: 'from-[#0a1128] via-[#101f42] to-[#050b1a]',
    badgeColor: 'border-sky-300/40 text-sky-200',
  },
  {
    id: 'nature',
    name: 'Kerala Lagoons',
    tag: 'Serene Backwaters',
    icon: Waves,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1920&q=90',
    titleAccent: 'from-emerald-300 via-teal-200 to-lime-300',
    glowColor: 'bg-emerald-500/10',
    buttonGrad: 'bg-blue-600 hover:bg-blue-700',
    bgGrad: 'from-[#041f17] via-[#093529] to-[#02120e]',
    badgeColor: 'border-emerald-300/40 text-emerald-200',
  },
  {
    id: 'heritage',
    name: 'Royal Heritage',
    tag: 'Taj & Grand Palaces',
    icon: Landmark,
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1920&q=90',
    titleAccent: 'from-amber-200 via-rose-200 to-amber-300',
    glowColor: 'bg-amber-500/10',
    buttonGrad: 'bg-blue-600 hover:bg-blue-700',
    bgGrad: 'from-[#140c06] via-[#24130c] to-[#0d0704]',
    badgeColor: 'border-amber-300/40 text-amber-200',
  },
];

const QUICK_DESTINATIONS = [
  { label: 'Goa', price: '₹17,500', icon: Palmtree, query: 'Goa', themeIdx: 0 },
  { label: 'Kashmir Gulmarg', price: '₹31,500', icon: Mountain, query: 'Kashmir', themeIdx: 1 },
  { label: 'Kerala Backwaters', price: '₹22,500', icon: Waves, query: 'Kerala', themeIdx: 2 },
  { label: 'Rajasthan Royal', price: '₹27,800', icon: Landmark, query: 'Rajasthan', themeIdx: 3 },
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
    price: 17500,
    originalPrice: 21000,
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
  { name: 'Beach Paradise', count: '2 Packages', icon: Palmtree, color: 'from-sky-500 to-blue-600', query: 'Beach' },
  { name: 'Hill Stations', count: '3 Packages', icon: Mountain, color: 'from-emerald-500 to-teal-600', query: 'Hill Station' },
  { name: 'Royal Heritage', count: '2 Packages', icon: Landmark, color: 'from-amber-500 to-orange-600', query: 'Heritage' },
  { name: 'Backwaters & Nature', count: '1 Package', icon: Waves, color: 'from-teal-500 to-emerald-700', query: 'Nature' },
  { name: 'Himalayan Adventure', count: '2 Packages', icon: Luggage, color: 'from-blue-600 to-slate-700', query: 'Adventure' },
  { name: 'Island Getaway', count: '1 Package', icon: Sun, color: 'from-rose-500 to-amber-600', query: 'Island' },
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

  const [dbPackages, setDbPackages] = useState<Package[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('cached_packages') || localStorage.getItem('cached_packages');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [favoriteCategory, setFavoriteCategory] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/packages')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setDbPackages(res.data.data);
          try {
            sessionStorage.setItem('cached_packages', JSON.stringify(res.data.data));
            localStorage.setItem('cached_packages', JSON.stringify(res.data.data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Fetch user bookings and analyze category preference
  useEffect(() => {
    if (user && getAuthToken()) {
      api.get('/api/bookings')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            const bookings = res.data.data;
            const categoryCounts: Record<string, number> = {};
            let mostRecentCategory: string | null = null;
            
            bookings.forEach((b: any) => {
              const cat = b.package?.category;
              if (cat) {
                if (!mostRecentCategory && b.status !== 'CANCELLED') {
                  mostRecentCategory = cat;
                }
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
              }
            });

            let topCat: string | null = mostRecentCategory;
            let maxCount = 0;
            for (const [cat, count] of Object.entries(categoryCounts)) {
              if (count > maxCount) {
                maxCount = count;
                topCat = cat;
              }
            }
            if (topCat) {
              setFavoriteCategory(topCat);
            }
          }
        })
        .catch(() => {});
    } else {
      setFavoriteCategory(null);
    }
  }, [user]);

  // Compute recommended / trending packages dynamically based on user history
  const displayPackages = useMemo(() => {
    if (favoriteCategory && dbPackages.length > 0) {
      const matched = dbPackages.filter((p) => p.category?.toLowerCase() === favoriteCategory.toLowerCase());
      const others = dbPackages.filter((p) => p.category?.toLowerCase() !== favoriteCategory.toLowerCase());
      const combined = [...matched, ...others].slice(0, 3);

      return combined.map((p) => {
        const originalPrice = Math.round(p.pricePerPerson * 1.18);
        const isFav = p.category?.toLowerCase() === favoriteCategory.toLowerCase();
        
        let packageHighlights: string[] = ['Handpicked 4-Star Stay', 'Guided Excursions', 'All-Inclusive Breakfast'];
        if (p.itinerary) {
          try {
            const parsed = typeof p.itinerary === 'string' ? JSON.parse(p.itinerary) : p.itinerary;
            if (Array.isArray(parsed) && parsed.length > 0) {
              packageHighlights = parsed.slice(0, 3).map((it: any) => typeof it === 'string' ? it : it.title || `Day ${it.day}: Sightseeing`);
            }
          } catch {
            const lines = typeof p.itinerary === 'string' ? p.itinerary.split('\n').filter((l: string) => l.trim().length > 0) : [];
            if (lines.length > 0) packageHighlights = lines.slice(0, 3);
          }
        }

        return {
          id: p.id,
          name: p.name,
          state: p.state || p.destination,
          price: p.pricePerPerson,
          originalPrice,
          duration: `${p.durationDays}D / ${p.durationNights}N`,
          category: p.category,
          rating: 4.9,
          reviewsCount: 140 + (p.name.length * 7) % 60,
          image: p.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          tag: isFav ? 'Recommended' : 'Trending',
          highlights: packageHighlights,
        };
      });
    }

    return featuredDestinations;
  }, [favoriteCategory, dbPackages]);

  // Dynamic Section Title & Subtitle based on user booking history
  const sectionTitle = useMemo(() => {
    if (!favoriteCategory) {
      return {
        badge: 'Curated Escapes',
        title: 'Top Trending Holiday Packages',
        subtitle: 'Our most popular itineraries with verified accommodations and guaranteed departures.',
      };
    }

    const cat = favoriteCategory.toLowerCase();
    if (cat.includes('hill') || cat.includes('mountain')) {
      return {
        badge: `Personalized For You (${favoriteCategory})`,
        title: 'Recommended Mountain & Hill Escapes',
        subtitle: `Based on your recent trip booking history, we handpicked these serene mountain packages for you.`,
      };
    }
    if (cat.includes('beach') || cat.includes('island')) {
      return {
        badge: `Personalized For You (${favoriteCategory})`,
        title: 'Recommended Coastal & Beach Escapes',
        subtitle: `Because you love coastal getaways, explore these top-rated beach tours.`,
      };
    }
    if (cat.includes('heritage') || cat.includes('culture') || cat.includes('spiritual')) {
      return {
        badge: `Personalized For You (${favoriteCategory})`,
        title: 'Recommended Royal Heritage & Cultural Tours',
        subtitle: `Curated for history & cultural enthusiasts based on your previous trip preferences.`,
      };
    }
    if (cat.includes('nature')) {
      return {
        badge: `Personalized For You (${favoriteCategory})`,
        title: 'Recommended Nature & Backwater Retreats',
        subtitle: `Handpicked tranquil nature and backwater getaways tailored to your travel history.`,
      };
    }

    return {
      badge: `Personalized For You (${favoriteCategory})`,
      title: `Recommended ${favoriteCategory} Packages`,
      subtitle: `Specially curated based on your past bookings and preferred travel vibe.`,
    };
  }, [favoriteCategory]);

  const getPackageUrl = (pkgNameOrId: string) => {
    const found = dbPackages.find(
      (p) =>
        p.id === pkgNameOrId ||
        p.name.toLowerCase().includes(pkgNameOrId.toLowerCase()) ||
        pkgNameOrId.toLowerCase().includes(p.name.toLowerCase()) ||
        p.destination.toLowerCase().includes(pkgNameOrId.toLowerCase())
    );
    const targetId = found ? found.id : pkgNameOrId;
    return `/packages/${targetId}`;
  };

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
  const [activeHeroTheme, setActiveHeroTheme] = useState(0);

  // Auto rotate hero themes
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroTheme((prev) => (prev + 1) % HERO_THEMES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const currentTheme = HERO_THEMES[activeHeroTheme];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDestination.trim()) params.append('search', searchDestination.trim());
    if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
    router.push(`/packages?${params.toString()}`);
  };

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <section className={`relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-b ${currentTheme.bgGrad} transition-colors duration-1000`}>
        <div className="absolute inset-0 z-0 overflow-hidden">
          {HERO_THEMES.map((theme, idx) => (
            <div
              key={theme.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === activeHeroTheme ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={theme.image}
                alt={theme.name}
                className="w-full h-full object-cover object-center brightness-[0.70] transition-transform duration-1000"
              />
            </div>
          ))}

          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/50 to-slate-950/95 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/40 to-slate-950/90" />
          
          <div className="hidden sm:block absolute -top-32 left-1/4 w-[34rem] h-[34rem] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="hidden sm:block absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center text-white pt-2">
          {/* Destination Mood Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {HERO_THEMES.map((theme, idx) => {
              const Icon = theme.icon;
              const isActive = idx === activeHeroTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setActiveHeroTheme(idx)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                      : 'bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-800 border-white/15'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  <span className="tracking-wide text-white">{theme.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.12] mb-5 text-white">
            Discover The Soul Of India,<br />
            <span className="text-blue-300">
              One Journey At A Time
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Premium curated tour packages with handpicked luxury stays, multi-city departures, and transparent all-inclusive pricing.
          </p>

          {/* Trip Planner Search Widget */}
          <div className="relative z-30 max-w-3xl mx-auto bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white mb-8">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              {/* Destination Input */}
              <div className="sm:col-span-5 text-left bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Where to?
                </label>
                <input
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="Goa, Kashmir, Manali, Kerala..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Category Picker */}
              <div ref={vibeRef} className="sm:col-span-4 text-left bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition relative z-40">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-500" /> Experience Vibe
                </label>
                <button
                  type="button"
                  onClick={() => setVibeDropdownOpen(!vibeDropdownOpen)}
                  className="w-full text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between py-0.5 text-left cursor-pointer"
                >
                  <span className="truncate">
                    {VIBE_OPTIONS.find((v) => v.value === selectedCategory)?.label || 'All Experiences'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${vibeDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {vibeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 max-h-60 overflow-y-auto no-scrollbar">
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
                          className={`w-full px-3 py-2 text-xs sm:text-sm font-medium flex items-center justify-between transition text-left cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${opt.color}`} />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit CTA Button */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full h-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Escapes</span>
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto relative z-10">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-slate-800 text-center">
              <div className="text-xl font-bold text-amber-400">4.9 ★</div>
              <div className="text-xs text-slate-300 mt-0.5">2,500+ Explorers</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-slate-800 text-center">
              <div className="text-xl font-bold text-blue-400">4+1 FREE</div>
              <div className="text-xs text-slate-300 mt-0.5">Group Ticket Offer</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-slate-800 text-center">
              <div className="text-xl font-bold text-emerald-400">20% OFF</div>
              <div className="text-xs text-slate-300 mt-0.5">Groups of 3+ Pax</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-slate-800 text-center">
              <div className="text-xl font-bold text-slate-200">₹0 Fee</div>
              <div className="text-xs text-slate-300 mt-0.5">Instant E-Voucher</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Offers & Promo Coupons from Database */}
      <section className="py-12 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 bg-amber-500 text-white rounded font-bold text-[10px] inline-flex items-center gap-1">
                  <Gift className="w-3 h-3" /> DEALS
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Offers & Promotions
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Live promotions, automatic group savings, and verified coupon codes.
              </p>
            </div>

            <Link
              href="/packages"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View All Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature Card 1: 4+1 Free */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <span className="text-blue-600 dark:text-blue-400">AUTOMATIC OFFER</span>
                  <span>4+ PAX</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  4+1 FREE Group Ticket Offer
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Book for 4 or more travelers and every 4th ticket is 100% FREE on the package price.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  AUTO-APPLIED
                </span>
                <Link href="/packages" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  BOOK NOW →
                </Link>
              </div>
            </div>

            {/* Feature Card 2: 20% Group Pass */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400">INSTANT 20% OFF</span>
                  <span>3+ PAX</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  20% Friends & Family Group Pass
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Travel with 3+ friends or family and automatically save a flat 20% on the entire booking.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  AUTO-APPLIED
                </span>
                <Link href="/packages" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  BOOK NOW →
                </Link>
              </div>
            </div>

            {/* Real Database Coupons Rendered Dynamically */}
            {coupons.slice(0, 2).map((c) => (
              <div key={c.code} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-blue-500" /> PROMO COUPON
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{c.discount}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    Use Promo Code {c.code}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {c.desc}. Apply at checkout to claim instant discount.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(c.code);
                      toast.success(`Coupon ${c.code} copied!`);
                    }}
                    className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <span>{c.code}</span>
                    <Copy className="w-3 h-3" />
                  </button>
                  <Link href="/packages" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    APPLY NOW →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore By Travel Vibe */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                <Compass className="w-4 h-4" /> Curated Experiences
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Explore By Travel Vibe
              </h2>
            </div>
            <Link
              href="/packages"
              className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse All 10 Packages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {categoryVibes.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/packages?category=${encodeURIComponent(cat.query)}`}
                  className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all flex flex-col items-center text-center"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-sm mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
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
              <span className="inline-block text-blue-600 dark:text-blue-400 font-bold text-xs tracking-wider uppercase mb-1.5">
                Unrivaled Beauty
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                India Is Waiting For You<br />
                <span className="text-blue-600 dark:text-blue-400">
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
            <div className="absolute top-5 left-5 bg-slate-950/80 backdrop-blur-md text-white border border-white/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>UNESCO World Heritage Circuit</span>
            </div>
            <div className="absolute bottom-5 right-5 bg-emerald-600/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Verified Local Guides</span>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* Top Trending & Personalized Packages Cards */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/60">
                {favoriteCategory ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{sectionTitle.badge}</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>{sectionTitle.badge}</span>
                  </>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {sectionTitle.title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                {sectionTitle.subtitle}
              </p>
            </div>
            <Link
              href={favoriteCategory ? `/packages?category=${encodeURIComponent(favoriteCategory)}` : '/packages'}
              className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>{favoriteCategory ? `Explore All ${favoriteCategory} Packages` : 'Explore All 10 Packages'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPackages.map((pkg) => {
              const discountAmount = pkg.originalPrice - pkg.price;

              return (
                <div
                  key={pkg.id || pkg.name}
                  className="group rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Image Cover */}
                  <Link href={getPackageUrl(pkg.id || pkg.name)} className="relative h-56 overflow-hidden block bg-slate-100 dark:bg-slate-800">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                    
                    {/* Top Badges */}
                    <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 shadow-sm">
                      {pkg.tag}
                    </span>
                    <span className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="font-bold">{pkg.rating}</span>
                      <span className="text-slate-300 text-[9px]">({pkg.reviewsCount})</span>
                    </span>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" /> {pkg.state}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold border border-white/15">
                        <Clock className="w-3 h-3 text-blue-300" /> {pkg.duration}
                      </span>
                    </div>
                  </Link>

                  {/* Body Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={getPackageUrl(pkg.id || pkg.name)}>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {pkg.name}
                        </h3>
                      </Link>

                      {/* Highlights Checklist */}
                      <div className="space-y-1 mb-4">
                        {pkg.highlights.map((h: string) => (
                          <div key={h} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="line-clamp-1">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 line-through font-medium">
                            ₹{pkg.originalPrice.toLocaleString()}
                          </span>
                          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                            SAVE ₹{discountAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">
                          ₹{pkg.price.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                          per person • taxes included
                        </span>
                      </div>

                      <Link
                        href={getPackageUrl(pkg.id || pkg.name)}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enterprise Trust & Safety Guarantees */}
      <section className="py-16 px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              The TripEase Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Why 2,500+ Explorers Trust TripEase
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5">
              Enterprise security, transparent pricing, and 24/7 dedicated travel support for peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Hotel className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                  100% Verified Stays
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every hotel, resort, and houseboat is physically inspected for hygiene, premium amenities, and prime location.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                3★, 4★ & Boutique Tiers
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                  <Plane className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                  Multi-City Departures
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Fly or ride from Delhi, Mumbai, Bangalore, Chennai, and Hyderabad with instant route booking and baggage support.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                Flights • Trains • AC Coaches
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                  24/7 Dedicated Concierge
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Direct WhatsApp concierge and emergency phone hotline at +91 72003 36447 before and during your entire journey.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Instant On-Trip Assistance
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                  Zero Hidden Fees
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Transparent GST-inclusive rates, flexible cancellation options, and 100% secure Razorpay transactions.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Razorpay & UPI Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step How It Works Stepper */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 mb-2">
            How Your Dream Vacation Begins
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-10">
            From discovering your destination to getting your boarding pass, we make every step seamless.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {[
              { step: '01', title: 'Pick Destination', desc: 'Browse 10 handpicked itineraries by beach, mountain, or heritage.', icon: Compass, color: 'text-blue-500' },
              { step: '02', title: 'Choose Departure', desc: 'Select travel date, passenger count, and your local departure city.', icon: Calendar, color: 'text-sky-500' },
              { step: '03', title: 'Apply Discounts', desc: 'Get automatic 20% group cuts, 4+1 free tickets, and coupon codes.', icon: Tag, color: 'text-amber-500' },
              { step: '04', title: 'Instant Booking', desc: 'Complete secure payment and receive your digital travel voucher.', icon: CheckCircle2, color: 'text-emerald-500' },
            ].map(({ step, title, desc, icon: Icon, color }) => (
              <div
                key={step}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm text-left relative group"
              >
                <div className="text-4xl font-bold text-slate-100 dark:text-slate-700/40 absolute top-3 right-4 select-none">
                  {step}
                </div>
                <div className={`w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
      <section className="py-16 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Real Explorer Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Loved By Travelers Across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs">{t.name}</h4>
                    <p className="text-[11px] text-slate-400">{t.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between font-semibold text-slate-800 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 pt-2.5">
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
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85"
            alt="Scenic Beach Getaway"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
            Limited Time Offers
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3 leading-tight">
            Ready To Start Your Next Adventure?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-6">
            Join thousands of smart travelers who book hassle-free tours with TripEase.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/packages"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm text-sm"
            >
              Explore All Packages
            </Link>
            <Link
              href={user?.role === 'ADMIN' ? "/admin" : user ? "/my-bookings" : "/register"}
              className="w-full sm:w-auto bg-slate-800/90 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg border border-slate-700 transition-colors text-sm"
            >
              {user?.role === 'ADMIN' ? "Go to Admin Dashboard" : user ? "View My Bookings" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <Footer />
    </>
  );
}
