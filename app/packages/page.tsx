'use client';

import { useEffect, useState, useMemo, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Package } from '@/lib/types';
import Link from 'next/link';
import { 
  MapPin, Clock, Users, Search, Filter, Heart, Plane, Car, Globe, 
  Sparkles, Star, Hotel, Utensils, Tag, LayoutGrid, List, ArrowUpDown, 
  X, Check, Flame, ChevronRight, ShieldCheck, Gift, Palmtree, Mountain,
  Landmark, Trees, Compass, Waves, TrendingDown, TrendingUp, ChevronDown, Crown, Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import WhatsAppButton from '@/components/WhatsAppButton';
import Footer from '@/components/Footer';
import { getAuthToken } from '@/lib/authStorage';

interface AvailableCoupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  isVip: boolean;
  packageId?: string | null;
  packageName?: string | null;
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured & Recommended', icon: Sparkles, color: 'text-amber-500' },
  { value: 'price-low', label: 'Price: Low to High', icon: TrendingDown, color: 'text-emerald-500' },
  { value: 'price-high', label: 'Price: High to Low', icon: TrendingUp, color: 'text-blue-500' },
  { value: 'duration', label: 'Duration: Longest First', icon: Clock, color: 'text-cyan-500' },
];

function PackagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [vipCoupons, setVipCoupons] = useState<AvailableCoupon[]>([]);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(45000);
  const [transportOnly, setTransportOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'duration'>('featured');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());

  const couponParam = searchParams.get('coupon');
  const getPkgUrl = (pkgId: string) => {
    const q = couponParam ? `?coupon=${encodeURIComponent(couponParam)}` : '';
    return user ? `/packages/${pkgId}${q}` : `/login?redirect=/packages/${pkgId}${q ? encodeURIComponent(q) : ''}`;
  };

  const getVipDealForPkg = (pkgId: string) => {
    return vipCoupons.find((c) => c.packageId === pkgId) || vipCoupons.find((c) => !c.packageId || c.packageId === 'ALL');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize URL query params with state
  useEffect(() => {
    const catQuery = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    const stateQuery = searchParams.get('state');

    if (catQuery) {
      setSelectedCategory(catQuery);
    } else {
      setSelectedCategory('All');
    }

    if (searchQuery) {
      setSearch(searchQuery);
    }

    if (stateQuery) {
      setStateFilter(stateQuery);
    }
  }, [searchParams]);

  // Fetch initial packages
  useEffect(() => {
    setLoading(true);
    api.get('/api/packages')
      .then((res) => {
        const pkgs: Package[] = res.data.data;
        setAllPackages(pkgs);

        // Extract unique categories
        const catSet = new Set<string>();
        catSet.add('All');
        pkgs.forEach((p) => {
          if (p.category) catSet.add(p.category);
        });
        setCategories(Array.from(catSet));
      })
      .catch(() => {
        setAllPackages([]);
      })
      .finally(() => setLoading(false));

    // Load wishlist
    if (getAuthToken()) {
      api.get('/api/wishlist')
        .then((res) => {
          const ids = new Set<string>(res.data.data.map((w: { packageId: string }) => w.packageId));
          setWishlisted(ids);
        })
        .catch(() => {});
    }

    // Load active VIP coupons/deals
    api.get('/api/coupons/available')
      .then((res) => {
        if (res.data?.data) {
          setVipCoupons(res.data.data.filter((c: AvailableCoupon) => c.isVip));
        }
      })
      .catch(() => {});
  }, []);

  // Filter & Sort computation
  const filteredPackages = useMemo(() => {
    let list = [...allPackages];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.destination.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (stateFilter.trim()) {
      list = list.filter((p) => p.state.toLowerCase().includes(stateFilter.toLowerCase()));
    }

    if (selectedCategory && selectedCategory !== 'All') {
      const target = selectedCategory.toLowerCase().trim();
      list = list.filter((p) => {
        const pkgCat = (p.category || '').toLowerCase().trim();
        return pkgCat === target || pkgCat.includes(target) || target.includes(pkgCat);
      });
    }

    if (maxPrice) {
      list = list.filter((p) => p.pricePerPerson <= maxPrice);
    }

    if (transportOnly) {
      list = list.filter((p) => p.transportIncluded);
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
    } else if (sortBy === 'duration') {
      list.sort((a, b) => b.durationDays - a.durationDays);
    } else {
      // Default: 'featured' -> Keep Goa 1st, Kerala 2nd, and the rest in curated order
      const getFeaturedRank = (name: string, dest: string, state: string) => {
        const text = `${name} ${dest} ${state}`.toLowerCase();
        if (text.includes('goa')) return 1;
        if (text.includes('kerala') || text.includes('alleppey')) return 2;
        if (text.includes('rajasthan') || text.includes('jaipur')) return 3;
        if (text.includes('manali') || text.includes('himachal')) return 4;
        if (text.includes('andaman')) return 5;
        if (text.includes('kashmir') || text.includes('srinagar')) return 6;
        if (text.includes('ladakh') || text.includes('leh')) return 7;
        if (text.includes('golden triangle') || text.includes('delhi')) return 8;
        if (text.includes('coorg')) return 9;
        if (text.includes('varanasi')) return 10;
        return 99;
      };

      list.sort((a, b) => {
        const rankA = getFeaturedRank(a.name, a.destination, a.state);
        const rankB = getFeaturedRank(b.name, b.destination, b.state);
        return rankA - rankB;
      });
    }

    return list;
  }, [allPackages, search, stateFilter, selectedCategory, maxPrice, transportOnly, sortBy]);

  const toggleWishlist = async (e: React.MouseEvent, pkgId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to save to wishlist');
      return;
    }

    try {
      if (wishlisted.has(pkgId)) {
        await api.delete(`/api/wishlist/${pkgId}`);
        setWishlisted((prev) => {
          const s = new Set(prev);
          s.delete(pkgId);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { count: s.size } }));
          }
          return s;
        });
        toast.success('Removed from wishlist');
      } else {
        await api.post('/api/wishlist', { packageId: pkgId });
        setWishlisted((prev) => {
          const s = new Set([...prev, pkgId]);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { count: s.size } }));
          }
          return s;
        });
        toast.success('Saved to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(window.location.search);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    const newUrl = params.toString() ? `/packages?${params.toString()}` : '/packages';
    router.replace(newUrl, { scroll: false });
  };

  const clearFilters = () => {
    setSearch('');
    setStateFilter('');
    setSelectedCategory('All');
    setMaxPrice(45000);
    setTransportOnly(false);
    setSortBy('featured');
    router.replace('/packages', { scroll: false });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'beach': return Palmtree;
      case 'hill station': return Mountain;
      case 'heritage': return Landmark;
      case 'nature': return Trees;
      case 'adventure': return Compass;
      case 'island': return Waves;
      case 'spiritual': return Sparkles;
      default: return Globe;
    }
  };

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        {/* Header Banner */}
        <section className="relative bg-slate-900 text-white py-12 px-4 border-b border-slate-800 shadow-sm">
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1 rounded-full text-xs font-medium text-slate-300 mb-3">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>10 Curated Indian Escapes</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-semibold">4+1 Free Ticket Active</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">
              Explore Our Tourism Packages
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
              Handcrafted holiday packages across India with verified hotels, sightseeing, flexible departures, and transparent pricing.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs text-slate-300">
              <span className="bg-slate-800/80 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-700">
                <Gift className="w-3.5 h-3.5 text-amber-400" /> 4+1 Free Ticket on 4+ Pax
              </span>
              <span className="bg-slate-800/80 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-700">
                <Tag className="w-3.5 h-3.5 text-emerald-400" /> 20% Group Discount (3+ Pax)
              </span>
              <span className="bg-slate-800/80 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Free Cancellation Option
              </span>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          {/* VIP Promo Banner if arrived via email / VIP link */}
          {searchParams.get('coupon') && (
            <div className="bg-amber-950/20 border border-amber-800/50 rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">VIP Exclusive Promo Active</span>
                    <span className="bg-amber-400/20 text-amber-200 text-xs font-mono font-bold px-2 py-0.5 rounded border border-amber-400/40">
                      {searchParams.get('coupon')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any tour below to automatically apply your VIP discount at checkout!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs Carousel */}
          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
              {categories.map((cat) => {
                const active = selectedCategory.toLowerCase() === cat.toLowerCase();
                const Icon = getCategoryIcon(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat === 'All' ? 'All Packages' : cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Filters Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 space-y-3.5 relative z-30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Search Box */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-blue-600" /> Search Packages
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Destination, state, activity..."
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> State / Region
                </label>
                <input
                  type="text"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  placeholder="e.g. Goa, Kerala, Himachal..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Max Price
                  </label>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Up to ₹{maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={45000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                />
              </div>

              {/* Sort By Custom Dropdown with Icons */}
              <div ref={sortRef} className="relative z-40">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" /> Sort By
                </label>
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    {(() => {
                      const selected = SORT_OPTIONS.find((s) => s.value === sortBy) || SORT_OPTIONS[0];
                      const Icon = selected.icon;
                      return (
                        <>
                          <Icon className={`w-3.5 h-3.5 ${selected.color} flex-shrink-0`} />
                          <span className="truncate font-medium text-xs sm:text-sm">{selected.label}</span>
                        </>
                      );
                    })()}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {sortDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 divide-y divide-slate-100 dark:divide-slate-800">
                    {SORT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value as typeof sortBy);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-xs sm:text-sm font-medium flex items-center justify-between transition text-left cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 font-bold" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sub-bar: Active Filter Chips & View Mode Switcher */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredPackages.length}</strong> destination{filteredPackages.length !== 1 ? 's' : ''}
                </span>

                {(search || stateFilter || (selectedCategory && selectedCategory !== 'All') || maxPrice < 45000) && (
                  <button
                    onClick={clearFilters}
                    className="text-rose-500 hover:text-rose-600 font-medium underline ml-2 cursor-pointer text-xs"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              {/* Grid / List View Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl h-96 animate-pulse border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Globe className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">No matching packages found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                Try adjusting your search criteria, price range, or category filter to discover other escapes.
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPackages.map((pkg) => {
                const originalPrice = Math.round(pkg.pricePerPerson * 1.18);
                const discountAmount = originalPrice - pkg.pricePerPerson;

                return (
                  <Link
                    key={pkg.id}
                    href={getPkgUrl(pkg.id)}
                    className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Card Media Header */}
                    <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {pkg.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Globe className="w-12 h-12" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

                      {/* Category Tag */}
                      <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 shadow-sm">
                        {pkg.category}
                      </span>

                      {/* VIP Exclusive Deal Badge */}
                      {(() => {
                        const vipDeal = getVipDealForPkg(pkg.id);
                        if (!vipDeal) return null;
                        const isVipUser = user?.isVip || user?.vipStatus === 'APPROVED' || user?.role === 'ADMIN';

                        if (isVipUser) {
                          return (
                            <span className="absolute top-3 right-12 bg-amber-500 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-amber-300">
                              <Crown className="w-3 h-3 fill-slate-950" /> VIP {vipDeal.discountType === 'PERCENTAGE' ? `${vipDeal.discountValue}% OFF` : `₹${vipDeal.discountValue} OFF`}
                            </span>
                          );
                        }
                        return (
                          <span className="absolute top-3 right-12 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-400" /> VIP Deal
                          </span>
                        );
                      })()}

                      {/* Wishlist Button (Users Only) */}
                      {user?.role !== 'ADMIN' && (
                        <button
                          onClick={(e) => toggleWishlist(e, pkg.id)}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                          title={wishlisted.has(pkg.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 transition ${
                              wishlisted.has(pkg.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          />
                        </button>
                      )}

                      {/* Location & Seats Pill */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <span className="flex items-center gap-1 font-medium text-slate-100">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" /> {pkg.destination}, {pkg.state}
                        </span>
                        <span className="bg-emerald-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                          {pkg.availableSeats} seats left
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Rating Row */}
                        <div className="flex items-center gap-2 mb-1.5 text-xs">
                          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded flex items-center gap-1 text-[10px]">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.8
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                            (120+ verified explorers)
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {pkg.name}
                        </h3>

                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed mb-3">
                          {pkg.shortDescription}
                        </p>

                        {/* Specs Badge Pills */}
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-3">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            {pkg.durationDays}D / {pkg.durationNights}N
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                            <Hotel className="w-3 h-3 text-amber-500" />
                            {pkg.hotelCategory}
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                            <Utensils className="w-3 h-3 text-emerald-500" />
                            Meals Incl.
                          </span>
                        </div>
                      </div>

                      {/* Bottom Price & CTA */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 line-through">
                              ₹{originalPrice.toLocaleString()}
                            </span>
                            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                              SAVE ₹{discountAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                            ₹{pkg.pricePerPerson.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            per person • taxes included
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors">
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-4">
              {filteredPackages.map((pkg) => {
                const originalPrice = Math.round(pkg.pricePerPerson * 1.18);
                const discountAmount = originalPrice - pkg.pricePerPerson;

                return (
                  <Link
                    key={pkg.id}
                    href={getPkgUrl(pkg.id)}
                    className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row"
                  >
                    <div className="md:w-72 h-48 md:h-auto relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      <img
                        src={pkg.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'}
                        alt={pkg.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                        {pkg.category}
                      </span>

                      {/* VIP Exclusive Deal Badge */}
                      {(() => {
                        const vipDeal = getVipDealForPkg(pkg.id);
                        if (!vipDeal) return null;
                        const isVipUser = user?.isVip || user?.vipStatus === 'APPROVED' || user?.role === 'ADMIN';

                        if (isVipUser) {
                          return (
                            <span className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-amber-300">
                              <Crown className="w-3 h-3 fill-slate-950" /> VIP {vipDeal.discountType === 'PERCENTAGE' ? `${vipDeal.discountValue}% OFF` : `₹${vipDeal.discountValue} OFF`}
                            </span>
                          );
                        }
                        return (
                          <span className="absolute bottom-3 left-3 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-400" /> VIP Exclusive
                          </span>
                        );
                      })()}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1 text-xs">
                              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded flex items-center gap-1 text-[10px]">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> 4.8
                              </span>
                              <span className="text-slate-500 text-[10px]">120+ reviews</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {pkg.name}
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" /> {pkg.destination}, {pkg.state}
                            </p>
                          </div>

                          {user?.role !== 'ADMIN' && (
                            <button
                              onClick={(e) => toggleWishlist(e, pkg.id)}
                              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:scale-110 transition cursor-pointer"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  wishlisted.has(pkg.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {pkg.shortDescription}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {pkg.durationDays}D / {pkg.durationNights}N
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                            <Hotel className="w-3.5 h-3.5 text-amber-500" /> {pkg.hotelCategory}
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                            <Utensils className="w-3.5 h-3.5 text-emerald-500" /> Meals Incl.
                          </span>
                          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800 text-[11px]">
                            {pkg.availableSeats} Seats Left
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 line-through">
                              ₹{originalPrice.toLocaleString()}
                            </span>
                            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                              SAVE ₹{discountAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-slate-900 dark:text-white">
                            ₹{pkg.pricePerPerson.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-slate-500 block">per person • taxes included</span>
                        </div>

                        <span className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shadow-sm">
                          <span>View Package</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading travel packages...</p>
        </div>
      }
    >
      <PackagesContent />
    </Suspense>
  );
}
