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
            <p className="text-slate-400 text-sm mt-1">Verify your email to continue</p>
          </div>

          {!showEmailEdit ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm cursor-not-allowed font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailEdit(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Entered wrong email? Change it
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Enter Verification OTP</label>
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
                <p className="text-slate-400 text-xs mt-2">Check your email inbox for the verification code (valid for 10 minutes)</p>
              </div>

              {error && (
                <div className="bg-rose-950/60 border border-rose-800 rounded-lg px-3.5 py-2.5 text-xs text-rose-200 font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm">
                {loading ? 'Verifying...' : (<>Verify Email <ArrowRight className="w-4 h-4" /></>)}
              </button>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Update Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg px-3.5 py-2.5 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <span>Make sure you enter a valid, active email address so you can receive the OTP.</span>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmailEdit(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailEdit(false);
                    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Already verified?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign In</Link>
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
