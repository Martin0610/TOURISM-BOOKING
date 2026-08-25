'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Compass, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
      
      // Get user from isolated session to check role
      const user = getAuthUser();
      if (user) {
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
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-2xl tracking-tight text-white leading-none">
                  TripEase
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1 pl-0.5">
                  Explore India
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value.toLowerCase() });
                    if (error) setError('');
                  }}
                  className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
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
                  className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Persistent Error Alert */}
            {error && (
              <div className="bg-rose-950/60 border border-rose-800 rounded-lg p-3 text-sm text-rose-200 font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="leading-snug text-xs">{error}</p>
                  {error.includes('verify your email') && (
                    <Link 
                      href={`/verify-email?email=${encodeURIComponent(form.email)}`}
                      className="text-xs text-amber-400 hover:underline font-semibold mt-1.5 inline-block"
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer text-sm"
            >
              {loading ? 'Signing in...' : (<>Sign In <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors"
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
