'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Compass, Mail, Key, ArrowRight, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [showEmailEdit, setShowEmailEdit] = useState(false);

  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [emailFromQuery]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push('/login');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOtp('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to resend OTP');
    } finally {
      setResending(false);
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
            <p className="text-white text-sm mt-1 font-medium">Verify your email to continue</p>
          </div>

          {!showEmailEdit ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full bg-white/10 border border-white/20 text-white/80 rounded-xl pl-10 pr-4 py-3 text-sm cursor-not-allowed font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailEdit(true)}
                  className="text-xs text-purple-300 hover:text-white mt-2 flex items-center gap-1 font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Entered wrong email? Go back
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Enter Verification OTP</label>
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
                <p className="text-white/70 text-xs mt-2">Check your email inbox for the verification code (valid for 10 minutes)</p>
              </div>

              {error && (
                <div className="bg-red-500/25 border border-red-400/50 rounded-xl px-4 py-3 text-sm text-white font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? 'Verifying...' : (<>Verify Email <ArrowRight className="w-4 h-4" /></>)}
              </button>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-sm text-purple-300 hover:text-white transition flex items-center gap-1.5 font-semibold cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Update Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-medium"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-4 py-3 text-sm text-yellow-200 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Make sure you entered the correct email during registration. If you need to change it, please contact support.</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailEdit(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailEdit(false);
                    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-white/50 mt-6">
            Already verified?{' '}
            <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
