'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Compass, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import PolicyModal, { PolicyType } from '@/components/PolicyModal';

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Very Weak', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Weak', color: 'bg-orange-500' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score === 4) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};

const inputCls = "w-full bg-white/20 border border-white/40 text-white placeholder-white/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/25";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [policyModal, setPolicyModal] = useState<PolicyType>(null);

  const strength = getPasswordStrength(form.password);
  const canSubmit = form.name && form.email && form.password && strength.score >= 3 && agreeTerms;

  // Email validation with debounce
  const validateEmail = async (email: string) => {
    if (!email || email.length < 5) return;
    
    setValidatingEmail(true);
    setEmailWarning('');
    setEmailSuggestion('');
    
    try {
      const res = await fetch('/api/auth/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();
      
      if (!data.valid) {
        setError(data.message);
      } else {
        setError('');
        if (data.suggestion) {
          setEmailSuggestion(data.suggestion);
          setEmailWarning(data.warning || `Did you mean ${data.suggestion}?`);
        }
      }
    } catch (err) {
      console.error('Email validation error:', err);
    } finally {
      setValidatingEmail(false);
    }
  };

  const handleEmailChange = (email: string) => {
    setForm({ ...form, email: email.toLowerCase() });
    setEmailWarning('');
    setEmailSuggestion('');
    
    // Debounce email validation
    const timeoutId = setTimeout(() => validateEmail(email), 800);
    return () => clearTimeout(timeoutId);
  };

  const applySuggestion = () => {
    if (emailSuggestion) {
      setForm({ ...form, email: emailSuggestion });
      setEmailSuggestion('');
      setEmailWarning('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength.score < 3) { setError('Please choose a stronger password before signing up.'); return; }
    if (!agreeTerms) { setError('Please read and tick the box to agree to the Terms of Service & Privacy Policy.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email.toLowerCase(),
          password: form.password,
          phone: form.phone || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      setError((err as Error).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
      {/* Background — Taj Mahal / India tourism */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-orange-900/75" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/25 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-3 group mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
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
            <p className="text-white text-sm mt-1 font-medium">Create your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-white/70" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/70" />
                <input type="email" value={form.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="you@example.com" className={inputCls} />
                {validatingEmail && (
                  <div className="absolute right-3 top-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {emailWarning && emailSuggestion && (
                <div className="mt-2 bg-yellow-500/20 border border-yellow-400/40 rounded-lg px-3 py-2 flex items-center justify-between">
                  <p className="text-xs text-yellow-200">{emailWarning}</p>
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="text-xs text-yellow-300 hover:text-yellow-100 font-semibold underline ml-2 cursor-pointer"
                  >
                    Use this
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-white/70" />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9876543210" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/70" />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/60 hover:text-white transition cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-white/25'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${strength.score >= 3 ? 'text-green-300' : strength.score === 2 ? 'text-orange-300' : 'text-red-300'}`}>
                    Strength: {strength.label}{strength.score < 3 ? ' — add uppercase, numbers or symbols' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Terms & Conditions Agreement Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (e.target.checked && error.includes('Terms')) setError('');
                }}
                className="mt-0.5 w-4 h-4 rounded border-white/40 bg-white/20 text-purple-600 focus:ring-purple-400 focus:ring-offset-0 cursor-pointer accent-purple-500"
              />
              <label htmlFor="agreeTerms" className="text-xs text-white/90 leading-relaxed cursor-pointer select-none">
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={() => setPolicyModal('terms')}
                  className="text-cyan-300 hover:text-cyan-200 underline font-bold cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setPolicyModal('privacy')}
                  className="text-cyan-300 hover:text-cyan-200 underline font-bold cursor-pointer"
                >
                  Privacy Policy
                </button>.
              </label>
            </div>

            {error && <div className="bg-red-500/25 border border-red-400/50 rounded-xl px-4 py-3 text-sm text-white font-medium">{error}</div>}

            <button type="submit" disabled={loading || !canSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25">
              {loading ? 'Creating account...' : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
            </button>
            {!canSubmit && form.password.length > 0 && strength.score < 3 && (
              <p className="text-xs text-center text-orange-300 font-medium">Improve password strength to enable signup</p>
            )}
            {!canSubmit && form.password.length > 0 && strength.score >= 3 && !agreeTerms && (
              <p className="text-xs text-center text-amber-200 font-medium">Please tick the box above to accept the Terms & Conditions</p>
            )}
          </form>

          <p className="text-center text-sm text-white/70 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-300 hover:text-purple-200 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Interactive Read & Exit Policy Modal */}
      <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />
    </div>
  );
}
