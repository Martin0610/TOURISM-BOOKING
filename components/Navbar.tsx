'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Compass, Heart, Sparkles, User as UserIcon, LogOut, 
  ShieldCheck, MapPin, ChevronDown, Mail, Phone, Crown, ShoppingBag 
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import api from '@/lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchWishlistCount = () => {
    if (user && user.role !== 'ADMIN' && localStorage.getItem('token')) {
      api.get('/api/wishlist')
        .then((res) => {
          if (res.data?.data) {
            setWishlistCount(res.data.data.length);
          }
        })
        .catch(() => {});
    } else {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    fetchWishlistCount();

    const handleWishlistUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ count?: number }>;
      if (customEvent?.detail?.count !== undefined) {
        setWishlistCount(customEvent.detail.count);
      } else {
        fetchWishlistCount();
      }
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdated);
  }, [user, pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full pt-3 pb-2 px-3 sm:px-6 transition-all duration-300">
      <div className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-slate-900/90 shadow-lg shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl' 
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border border-slate-200/60 dark:border-slate-800/60'
      }`}>
        <div className="flex justify-between items-center h-16 px-4 sm:px-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-purple-600 dark:bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                TripEase
              </span>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 tracking-wider uppercase -mt-0.5 pl-0.5">
                Explore India
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              Home
            </Link>

            <Link
              href="/packages"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive('/packages')
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              Packages
            </Link>

            {user && user.role !== 'ADMIN' && (
              <>
                <Link
                  href="/my-bookings"
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive('/my-bookings')
                      ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  My Bookings
                </Link>

                <Link
                  href="/wishlist"
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 relative ${
                    isActive('/wishlist')
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isActive('/wishlist') ? 'fill-rose-600 dark:fill-rose-400 text-rose-600 dark:text-rose-400' : ''}`} />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user && user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            {/* VIP Club placed at the very last position */}
            <Link
              href="/vip"
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isActive('/vip')
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm font-bold'
                  : 'text-amber-600 dark:text-amber-400 hover:text-amber-500 font-semibold'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>VIP Club</span>
            </Link>
          </nav>

          {/* Desktop Right Side CTA & Theme */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    userDropdownOpen
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 dark:border-purple-600 ring-2 ring-purple-400/20'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180 text-purple-600' : ''}`} />
                  </div>
                </button>

                {/* User Details Dropdown Modal */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-200/80 dark:border-slate-800 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                    {/* User Profile Header */}
                    <div className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 text-white text-base font-extrabold flex items-center justify-center shadow-md shadow-purple-600/30 flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {user.name}
                          </h4>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-900'
                          }`}>
                            {user.role === 'ADMIN' ? 'Admin' : 'Traveler'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <span className="whitespace-nowrap">{user.phone || 'No phone registered'}</span>
                        </p>
                      </div>
                    </div>

                    {/* VIP Status Pill Card */}
                    <div className={`p-3 rounded-2xl border ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-50/60 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60'
                        : user.isVip || user.vipStatus === 'APPROVED'
                        ? 'bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border-amber-300 dark:border-amber-500/40'
                        : user.vipStatus === 'PENDING'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Crown className={`w-4 h-4 ${
                            user.role === 'ADMIN' || user.isVip || user.vipStatus === 'APPROVED'
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-400'
                          }`} />
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {user.role === 'ADMIN'
                              ? 'Administrator Access'
                              : user.isVip || user.vipStatus === 'APPROVED'
                              ? '👑 VIP Elite Member'
                              : user.vipStatus === 'PENDING'
                              ? '⏳ VIP Under Review'
                              : 'Standard Member'}
                          </span>
                        </div>
                        <Link
                          href={user.role === 'ADMIN' ? '/admin/vip' : '/vip'}
                          onClick={() => setUserDropdownOpen(false)}
                          className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {user.role === 'ADMIN' ? 'Manage' : 'VIP Hub →'}
                        </Link>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {user.role === 'ADMIN'
                          ? 'Full administrative control over trips, VIP members, and coupons.'
                          : user.isVip || user.vipStatus === 'APPROVED'
                          ? 'Enjoy exclusive VIP discounts, private flash sales & 24/7 concierge.'
                          : user.vipStatus === 'PENDING'
                          ? 'Your VIP application is currently under review by our concierge.'
                          : 'Spend ₹60,000+ across vacations to unlock VIP Elite benefits.'}
                      </p>
                    </div>

                    {/* Travel Activity Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Trips Booked</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">
                          {user.totalBookings ?? 0} Trips
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Spend</span>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400 mt-0.5 block">
                          ₹{(user.totalSpent ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      {user.role === 'ADMIN' ? (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/my-bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition"
                          >
                            <ShoppingBag className="w-4 h-4 text-purple-600" />
                            <span>My Bookings</span>
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-300 transition"
                          >
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span>My Wishlist ({wishlistCount})</span>
                          </Link>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 px-3.5 py-1.5 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pt-2 pb-5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-2">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                isActive('/') ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Compass className="w-4 h-4" /> Home
            </Link>

            <Link
              href="/packages"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                isActive('/packages') ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <MapPin className="w-4 h-4" /> Packages
            </Link>

            {user && (
              <>
                {user.role !== 'ADMIN' && (
                  <>
                    <Link
                      href="/my-bookings"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                        isActive('/my-bookings') ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" /> My Bookings
                    </Link>

                    <Link
                      href="/wishlist"
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium ${
                        isActive('/wishlist') ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" /> My Wishlist
                      </span>
                      {wishlistCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-rose-500 text-white rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
              </>
            )}

            {/* VIP Club placed at the very last position */}
            <Link
              href="/vip"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                isActive('/vip') ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-semibold'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> VIP Club & Perks
            </Link>

            {user ? (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Signed in as {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="text-center py-2 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-center py-2 text-sm font-semibold rounded-xl bg-purple-600 text-white shadow-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
