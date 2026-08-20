'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Compass, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, ChevronDown, Check } from 'lucide-react';
import PolicyModal, { PolicyType } from '@/components/PolicyModal';
import { COUNTRY_CODES, formatPhoneNumber } from '@/lib/countryCodes';

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
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [policyModal, setPolicyModal] = useState<PolicyType>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const strength = getPasswordStrength(form.password);
  const canSubmit = form.name && form.email && form.password && strength.score >= 3 && agreeTerms;

  const handlePolicyAccept = (acceptedType: PolicyType) => {
    if (acceptedType === 'terms') {
      setHasReadTerms(true);
      if (!hasReadPrivacy) {
        toast.success('Terms of Service reviewed. Opening Privacy Policy...', { duration: 3000 });
        setTimeout(() => setPolicyModal('privacy'), 400);
      } else {
        setAgreeTerms(true);
        if (error.includes('Terms')) setError('');
        toast.success('Agreements confirmed and accepted.', { duration: 3000 });
      }
    } else if (acceptedType === 'privacy') {
      setHasReadPrivacy(true);
      if (!hasReadTerms) {
        toast.success('Privacy Policy reviewed. Opening Terms of Service...', { duration: 3000 });
        setTimeout(() => setPolicyModal('terms'), 400);
      } else {
        setAgreeTerms(true);
        if (error.includes('Terms')) setError('');
        toast.success('Agreements confirmed and accepted.', { duration: 3000 });
      }
    }
  };

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
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();
      
      if (!data.valid) {
        setError(data.message);
      } else {
        setError('');
        if (data.suggestion && data.suggestion.toLowerCase().trim() !== email.toLowerCase().trim()) {
          setEmailSuggestion(data.suggestion);
          setEmailWarning(data.warning || `Did you mean ${data.suggestion}?`);
        } else {
          setEmailSuggestion('');
          setEmailWarning('');
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
    
    const digits = phone.replace(/\D/g, '');
    if (digits && digits.length !== 10) {
      setError(`Please enter a valid 10-digit mobile number (${digits.length}/10 digits entered).`);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const formattedPhone = digits ? formatPhoneNumber(countryCode, digits) : undefined;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email.toLowerCase().trim(),
          password: form.password,
          phone: formattedPhone,
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
      {/* Background — Majestic Scenic Alpine Sunset (Updated for Signup) */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/85 via-black/60 to-purple-900/80 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/25 rounded-3xl p-8 shadow-2xl shadow-purple-950/60">
          <div className="text-center mb-7">
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
            <p className="text-white text-sm mt-1 font-medium">Create your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe" className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                <input type="email" value={form.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="you@example.com" className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-medium" />
                {validatingEmail && (
                  <div className="absolute right-3 top-3.5">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {emailWarning && emailSuggestion && emailSuggestion.toLowerCase().trim() !== form.email.toLowerCase().trim() && (
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

            {/* Mobile Number with Custom Project-Handled Country Code Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-white">Mobile Number (Optional)</label>
                {phone && (
                  <span className={`text-[10px] font-mono font-bold ${
                    phone.length === 10 ? 'text-emerald-400' : 'text-amber-300'
                  }`}>
                    {phone.length}/10 digits
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {/* Custom Country Code Dropdown */}
                <div className="relative" ref={countryRef}>
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className={`h-[46px] bg-white/15 border rounded-xl px-2.5 text-xs text-white font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm min-w-[95px] justify-between ${
                      countryDropdownOpen
                        ? 'border-purple-300 ring-2 ring-purple-400/40 bg-white/25'
                        : 'border-white/30 hover:border-white/50 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">
                        {(COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0]).flag}
                      </span>
                      <span className="font-mono text-xs">
                        {(COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0]).code}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>

                  {countryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-purple-500/30 py-1.5 z-50 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-white/10 text-white">
                      {COUNTRY_CODES.map((c) => {
                        const isSelected = countryCode === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(c.code);
                              setCountryDropdownOpen(false);
                            }}
                            className={`w-full px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition text-left cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600/50 text-white font-bold'
                                : 'text-slate-200 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{c.flag}</span>
                              <div>
                                <span className="font-bold">{c.name}</span>
                                <span className="text-[10px] text-white/60 block font-mono">{c.code}</span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 font-bold" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                  <input
                    type="tel"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                      if (error.includes('mobile number')) setError('');
                    }}
                    placeholder="9876543210 (10 digits)"
                    className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-mono tracking-wide font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/70" />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className="w-full bg-white/15 border border-white/30 text-white placeholder-white/50 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-white/70 hover:text-white transition cursor-pointer">
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

            {/* Terms & Conditions Agreement Checkbox with Mandatory Read Lock */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => {
                  if (!hasReadTerms || !hasReadPrivacy) {
                    e.preventDefault();
                    toast('Please review the agreements till the end before accepting.');
                    if (!hasReadTerms) setPolicyModal('terms');
                    else if (!hasReadPrivacy) setPolicyModal('privacy');
                    return;
                  }
                  setAgreeTerms(e.target.checked);
                  if (e.target.checked && error.includes('Terms')) setError('');
                }}
                className="mt-0.5 w-4 h-4 rounded border-white/40 bg-white/20 text-purple-600 focus:ring-purple-400 focus:ring-offset-0 cursor-pointer accent-purple-500"
              />
              <label 
                htmlFor="agreeTerms" 
                onClick={(e) => {
                  if (!hasReadTerms || !hasReadPrivacy) {
                    e.preventDefault();
                    toast('Please review the agreements till the end before accepting.');
                    if (!hasReadTerms) setPolicyModal('terms');
                    else if (!hasReadPrivacy) setPolicyModal('privacy');
                  }
                }}
                className="text-xs text-white/90 leading-relaxed cursor-pointer select-none"
              >
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPolicyModal('terms');
                  }}
                  className="text-purple-300 hover:text-white underline font-bold cursor-pointer inline-flex items-center gap-0.5"
                >
                  <span>Terms of Service</span>
                  {hasReadTerms ? (
                    <span className="text-emerald-400 font-black text-[11px] ml-0.5">✓</span>
                  ) : (
                    <span className="text-[10px] ml-1 bg-purple-400/20 border border-purple-400/40 text-purple-200 px-1.5 py-0.2 rounded font-normal">Tap to read</span>
                  )}
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPolicyModal('privacy');
                  }}
                  className="text-purple-300 hover:text-white underline font-bold cursor-pointer inline-flex items-center gap-0.5"
                >
                  <span>Privacy Policy</span>
                  {hasReadPrivacy ? (
                    <span className="text-emerald-400 font-black text-[11px] ml-0.5">✓</span>
                  ) : (
                    <span className="text-[10px] ml-1 bg-purple-400/20 border border-purple-400/40 text-purple-200 px-1.5 py-0.2 rounded font-normal">Tap to read</span>
                  )}
                </button>.
              </label>
            </div>

            {error && <div className="bg-red-500/25 border border-red-400/50 rounded-xl px-4 py-3 text-sm text-white font-medium">{error}</div>}

            <button type="submit" disabled={loading || !canSubmit}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer">
              {loading ? 'Creating account...' : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
            </button>
            {!canSubmit && form.password.length > 0 && strength.score < 3 && (
              <p className="text-xs text-center text-orange-300 font-medium">Improve password strength to enable signup</p>
            )}
            {!canSubmit && form.password.length > 0 && strength.score >= 3 && !agreeTerms && (
              <p className="text-xs text-center text-purple-200 font-medium">
                {!hasReadTerms || !hasReadPrivacy ? 'Please read the Terms & Privacy Policy to enable agreement' : 'Please tick the box above to accept the Terms & Conditions'}
              </p>
            )}
          </form>

          <p className="text-center text-sm text-white/80 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-300 hover:text-white font-bold underline transition-colors">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Interactive Read & Exit Policy Modal with onAccept */}
      <PolicyModal 
        type={policyModal} 
        onClose={() => setPolicyModal(null)} 
        onAccept={handlePolicyAccept}
      />
    </div>
  );
}
