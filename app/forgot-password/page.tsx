'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Compass, Mail, Lock, ArrowRight, Key } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStep('otp');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStep('reset');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push('/login');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
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
            <p className="text-slate-400 text-sm mt-1">Reset your password</p>
          </div>

          {/* Step 1: Enter Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value.toLowerCase()); setError(''); }}
                    className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-950/60 border border-rose-800 rounded-lg px-3.5 py-2.5 text-xs text-rose-200 font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm">
                {loading ? 'Sending OTP...' : (<>Send OTP <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Enter OTP</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                    className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono tracking-widest font-bold text-center text-lg"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-slate-400 text-xs mt-2">Check your email for the OTP (valid for 10 minutes)</p>
              </div>

              {error && (
                <div className="bg-rose-950/60 border border-rose-800 rounded-lg px-3.5 py-2.5 text-xs text-rose-200 font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm">
                {loading ? 'Verifying...' : (<>Verify OTP <ArrowRight className="w-4 h-4" /></>)}
              </button>

              <button type="button" onClick={() => setStep('email')}
                className="w-full text-blue-400 hover:text-blue-300 text-xs font-semibold transition cursor-pointer">
                ← Back to email
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-950/60 border border-rose-800 rounded-lg px-3.5 py-2.5 text-xs text-rose-200 font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm">
                {loading ? 'Resetting...' : (<>Reset Password <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
