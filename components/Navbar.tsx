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
import { getAuthToken } from '@/lib/authStorage';

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
    if (user && user.role !== 'ADMIN' && getAuthToken()) {
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
    <header className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 pointer-events-none">
      <div className={`transition-all duration-300 pointer-events-auto ${
        scrolled 
          ? (menuOpen 
              ? 'max-w-6xl mx-auto mt-3 px-4 sm:px-7 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md' 
              : 'max-w-6xl mx-auto mt-3 px-4 sm:px-7 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md')
          : 'w-full px-4 sm:px-8 lg:px-12 rounded-none bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-xs'
      }`}>
        <div className={`flex justify-between items-center transition-all duration-300 ${scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'}`}>
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                TripEase
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-0.5 pl-0.5">
                Explore India
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Single outer layer with clean spacious links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className={`text-sm transition-colors ${
                isActive('/')
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium'
              }`}
            >
              Home
            </Link>

            <Link
              href="/packages"
              className={`text-sm transition-colors ${
                isActive('/packages')
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium'
              }`}
            >
              Packages
            </Link>

            {user && user.role !== 'ADMIN' && (
              <>
                <Link
                  href="/my-bookings"
                  className={`text-sm transition-colors ${
                    isActive('/my-bookings')
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium'
                  }`}
                >
                  My Bookings
                </Link>

                <Link
                  href="/wishlist"
                  className={`text-sm transition-colors flex items-center gap-1.5 relative ${
                    isActive('/wishlist')
                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium'
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
                className={`text-sm transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* VIP Club placed at the very last position */}
            <Link
              href="/vip"
              className={`text-sm transition-colors flex items-center gap-1.5 ${
                isActive('/vip')
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    userDropdownOpen
                      ? 'bg-blue-50 dark:bg-slate-800 border-blue-400 dark:border-blue-500'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </div>
                </button>

                {/* User Details Dropdown Modal */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in duration-150 space-y-3">
                    {/* User Profile Header */}
                    <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {user.name}
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            user.role === 'ADMIN'
                              ? 'bg-slate-900 text-white'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                          }`}>
                            {user.role === 'ADMIN' ? 'Admin' : 'Traveler'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="whitespace-nowrap">{user.phone || 'No phone registered'}</span>
                        </p>
                      </div>
                    </div>

                    {/* VIP Status Pill Card */}
                    <div className={`p-2.5 rounded-lg border ${
                      user.role === 'ADMIN'
                        ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        : user.isVip || user.vipStatus === 'APPROVED'
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                        : user.vipStatus === 'PENDING'
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Crown className={`w-3.5 h-3.5 ${
                            user.role === 'ADMIN' || user.isVip || user.vipStatus === 'APPROVED'
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-400'
                          }`} />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {user.role === 'ADMIN'
                              ? 'Administrator'
                              : user.isVip || user.vipStatus === 'APPROVED'
                              ? 'VIP Elite Member'
                              : user.vipStatus === 'PENDING'
                              ? 'VIP Under Review'
                              : 'Standard Member'}
                          </span>
                        </div>
                        <Link
                          href={user.role === 'ADMIN' ? '/admin/vip' : '/vip'}
                          onClick={() => setUserDropdownOpen(false)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {user.role === 'ADMIN' ? 'Manage' : 'VIP Hub →'}
                        </Link>
                      </div>
                    </div>

                    {/* Travel Activity Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Trips Booked</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 block">
                          {user.totalBookings ?? 0} Trips
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Spend</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
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
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/my-bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition"
                          >
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                            <span>My Bookings</span>
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition"
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
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer text-left"
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
                  className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3.5 py-1.5 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
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
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pt-2 pb-5 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/') ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Compass className="w-4 h-4" /> Home
            </Link>

            <Link
              href="/packages"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/packages') ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        isActive('/my-bookings') ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" /> My Bookings
                    </Link>

                    <Link
                      href="/wishlist"
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800"
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
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
                  className="text-center py-2 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-center py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white shadow-sm"
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
