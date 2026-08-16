'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Globe, Mail, Key, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

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

      toast.success('Email verified! You can now login.');
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

      toast.success('New OTP sent to your email!');
      setOtp('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl mb-2">
              <Globe className="w-7 h-7 text-green-400" /> TripEase
            </Link>
            <p className="text-white/60 text-sm mt-1">Verify your email to continue</p>
          </div>

          {!showEmailEdit ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full bg-white/5 border border-white/10 text-white/70 rounded-xl pl-10 pr-4 py-3 text-sm cursor-not-allowed"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailEdit(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Entered wrong email? Go back
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Enter Verification OTP</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-white/50 text-xs mt-2">Check your email inbox for the verification code (valid for 10 minutes)</p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2">
                {loading ? 'Verifying...' : (<>Verify Email <ArrowRight className="w-4 h-4" /></>)}
              </button>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-sm text-white/60 hover:text-white transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Update Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-4 py-3 text-sm text-yellow-200">
                ⚠️ Make sure you entered the correct email during registration. If you need to change it, please contact support.
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
