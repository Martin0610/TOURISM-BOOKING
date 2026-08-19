'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Compass, Heart, Sparkles, User as UserIcon, LogOut, ShieldCheck, MapPin } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import api from '@/lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user && localStorage.getItem('token')) {
      api.get('/api/wishlist')
        .then((res) => {
          if (res.data?.data) {
            setWishlistCount(res.data.data.length);
          }
        })
        .catch(() => {});
    }
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
          ? 'glass-panel shadow-xl shadow-cyan-500/5 dark:shadow-indigo-500/5 border border-white/60 dark:border-slate-800/80 backdrop-blur-xl' 
          : 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-md border border-slate-200/60 dark:border-slate-800/60'
      }`}>
        <div className="flex justify-between items-center h-16 px-4 sm:px-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300">
              <Compass className="w-5 h-5 text-white animate-pulse-glow" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent group-hover:opacity-95">
                TripEase
              </span>
              <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase -mt-0.5 pl-1">
                Explore India
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-slate-100/70 dark:bg-slate-800/60 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400'
              }`}
            >
              Home
            </Link>

            <Link
              href="/packages"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive('/packages')
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400'
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
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400'
                  }`}
                >
                  My Bookings
                </Link>

                <Link
                  href="/wishlist"
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 relative ${
                    isActive('/wishlist')
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm shadow-pink-500/30 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isActive('/wishlist') ? 'fill-white' : ''}`} />
                  <span>My Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
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
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                    : 'text-cyan-600 dark:text-cyan-400 hover:text-blue-600 font-semibold'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Desktop Right Side CTA & Theme */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 px-3 py-2 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="relative group overflow-hidden rounded-full p-[1px] focus:outline-none"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-full group-hover:opacity-90 transition-opacity" />
                  <span className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 group-hover:scale-[0.98] transition-transform">
                    <Sparkles className="w-3.5 h-3.5" />
                    Get Started
                  </span>
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
                isActive('/') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Compass className="w-4 h-4" /> Home
            </Link>

            <Link
              href="/packages"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                isActive('/packages') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <MapPin className="w-4 h-4" /> Packages
            </Link>

            {user ? (
              <>
                {user.role !== 'ADMIN' && (
                  <>
                    <Link
                      href="/my-bookings"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                        isActive('/my-bookings') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" /> My Bookings
                    </Link>

                    <Link
                      href="/wishlist"
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium ${
                        isActive('/wishlist') ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
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
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin Panel
                  </Link>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Signed in as {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </>
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
                  className="text-center py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30"
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
