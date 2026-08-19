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
            <p className="text-white text-sm mt-1 font-medium">Reset your password</p>
          </div>

          {/* Step 1: Enter Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value.toLowerCase()); setError(''); }}
                    className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-medium"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/25 border border-red-400/50 rounded-xl px-4 py-3 text-sm text-white font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !email}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? 'Sending OTP...' : (<>Send OTP <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Enter OTP</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                    className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-mono tracking-widest font-bold text-center text-lg"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-white/70 text-xs mt-2">Check your email for the OTP (valid for 10 minutes)</p>
              </div>

              {error && (
                <div className="bg-red-500/25 border border-red-400/50 rounded-xl px-4 py-3 text-sm text-white font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? 'Verifying...' : (<>Verify OTP <ArrowRight className="w-4 h-4" /></>)}
              </button>

              <button type="button" onClick={() => setStep('email')}
                className="w-full text-purple-300 hover:text-white text-sm font-semibold transition cursor-pointer">
                ← Back to email
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-medium"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-medium"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/25 border border-red-400/50 rounded-xl px-4 py-3 text-sm text-white font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? 'Resetting...' : (<>Reset Password <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-white/80 mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-purple-300 hover:text-white font-bold underline transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
