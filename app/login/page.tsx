'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Compass, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, X, ShieldCheck, Gift, Tag, Sparkles } from 'lucide-react';
import { getAuthUser } from '@/lib/authStorage';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next');
  const emailParam = searchParams.get('email') || '';

  const [form, setForm] = useState({ email: emailParam, password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = form.email.trim().length > 0 && form.password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!isValidEmail) {
      setError('Please enter a valid email address (e.g. name@example.com)');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      
      const user = getAuthUser();
      if (user) {
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else if (redirectUrl && redirectUrl.startsWith('/')) {
          router.push(redirectUrl);
        } else {
          router.push('/');
        }
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (redirectUrl && redirectUrl.startsWith('/')) {
      router.push(redirectUrl);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      {/* Background Scenic Landscape */}
      <div className="fixed inset-0 -z-10">
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600" 
          alt="Travel Background" 
          className="w-full h-full object-cover brightness-50" 
        />
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" />
      </div>

      {/* Floating Modal Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-30 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          title="Close and return"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Visual Promotional Banner (MakeMyTrip / AbhiBus Style) */}
        <div className="relative md:w-5/12 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white flex flex-col justify-between overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800" 
              alt="Holiday" 
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="relative z-10">
            {/* Brand Header */}
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-xl tracking-tight text-white leading-none">
                  TripEase
                </span>
                <span className="text-[9px] font-semibold text-blue-200 tracking-wider uppercase mt-0.5">
                  Explore India
                </span>
              </div>
            </Link>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight mb-2">
              Unlock Exclusive Vacation Deals
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Sign in to manage itineraries, track active bookings, and enjoy automated group savings.
            </p>

            {/* Feature Perks List */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Gift className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div>
                  <strong className="block text-white font-semibold">4+1 Free Ticket Program</strong>
                  <span>Automatic complimentary ticket on groups of 4+</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <div>
                  <strong className="block text-white font-semibold">20% Group Discount</strong>
                  <span>Instant saving applied on family & group packages</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                </div>
                <div>
                  <strong className="block text-white font-semibold">100% Verified Stays</strong>
                  <span>Handcrafted itineraries with transparent all-inclusive prices</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Promo Pill */}
          <div className="relative z-10 mt-6 pt-4 border-t border-slate-700/60 flex items-center gap-2 text-xs text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>VIP Club patrons receive unlisted private rates</span>
          </div>
        </div>

        {/* Right Side Form (MakeMyTrip Floating Style) */}
        <div className="md:w-7/12 p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            {/* Top Toggle Switch (Sign In / Create Account) */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 max-w-xs">
              <span className="flex-1 py-1.5 px-3 text-xs font-bold text-center rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs">
                Sign In
              </span>
              <Link 
                href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
                className="flex-1 py-1.5 px-3 text-xs font-semibold text-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Create Account
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access your traveler profile
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value.toLowerCase() });
                      if (error) setError('');
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (error) setError('');
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Persistent Error Alert */}
              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-200 font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="leading-snug">{error}</p>
                    {error.includes('verify your email') && (
                      <Link 
                        href={`/verify-email?email=${encodeURIComponent(form.email)}`}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold mt-1.5 inline-block"
                      >
                        Click here to enter verification OTP →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading || !canSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? 'Signing in...' : (<>Sign In <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold hover:underline transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
