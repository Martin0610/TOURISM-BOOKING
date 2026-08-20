'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Compass, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

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

  // Button unlocks as soon as they have entered some email and at least 6 characters for password
  const canSubmit = form.email.trim().length > 0 && form.password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if email format is valid
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
      
      // Get user from localStorage to check role
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Redirect based on role and redirect query param
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

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
      {/* Background — Preserved Scenic Landscape */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/85 via-black/60 to-purple-900/80 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/25 rounded-3xl p-8 shadow-2xl shadow-purple-950/60">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:opacity-95 leading-none">
                  TripEase
                </span>
                <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase mt-1 pl-1">
                  Explore India
                </span>
              </div>
            </Link>
            <p className="text-white text-sm mt-1 font-medium">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value.toLowerCase() });
                    if (error) setError('');
                  }}
                  className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-medium"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-white">Password</label>
                <Link href="/forgot-password" className="text-xs text-purple-300 hover:text-white font-semibold transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (error) setError('');
                  }}
                  className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-medium"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-white/70 hover:text-white transition cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Persistent Error Alert (Stays until user enters new details) */}
            {error && (
              <div className="bg-rose-500/25 border border-rose-400/50 rounded-xl p-3.5 text-sm text-white font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-300 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="leading-snug text-xs sm:text-sm">{error}</p>
                  {error.includes('verify your email') && (
                    <Link 
                      href={`/verify-email?email=${encodeURIComponent(form.email)}`}
                      className="text-xs text-amber-300 hover:underline font-bold mt-1.5 inline-block"
                    >
                      Click here to enter verification OTP →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button (Only unlocks once 6 digits/chars are typed for password) */}
            <button 
              type="submit" 
              disabled={loading || !canSubmit}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? 'Signing in...' : (<>Sign In <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <p className="text-center text-sm text-white/80 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
              className="text-purple-300 hover:text-white font-bold underline transition-colors"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
