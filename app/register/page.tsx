'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Compass, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, ChevronDown, Check, X } from 'lucide-react';
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

const inputCls = "w-full bg-white/20 border border-white/40 text-white placeholder-white/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/25";

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
  const canSubmit = form.name && form.email && form.password && phone.replace(/\D/g, '').length === 10 && strength.score >= 3 && agreeTerms;

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
    if (form.password.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    if (strength.score < 3) { setError('Please choose a stronger password before signing up.'); return; }
    if (!agreeTerms) { setError('Please read and tick the box to agree to the Terms of Service & Privacy Policy.'); return; }
    
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length !== 10) {
      setError(`Please enter a valid 10-digit mobile number (${digits ? digits.length : 0}/10 digits entered).`);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(countryCode, digits);
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

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const redirectUrl = searchParams ? searchParams.get('redirect') || searchParams.get('next') : null;

  const handleClose = () => {
    if (redirectUrl && redirectUrl.startsWith('/')) {
      router.push(redirectUrl);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      {/* Background — Majestic Scenic Alpine Sunset */}
      <div className="fixed inset-0 -z-10">
        <img 
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600" 
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
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" 
              alt="Beach Holiday" 
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
              Start Your Journey With Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Create an account to book handcrafted packages, unlock group savings, and access instant vouchers.
            </p>

            {/* Feature Perks List */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-300 font-bold">🎟️</span>
                </div>
                <div>
                  <strong className="block text-white font-semibold">4+1 Free Ticket Program</strong>
                  <span>Automatic complimentary ticket on groups of 4+</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-300 font-bold">🏷️</span>
                </div>
                <div>
                  <strong className="block text-white font-semibold">20% Group Discount</strong>
                  <span>Instant saving applied on family & group packages</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sky-300 font-bold">🛡️</span>
                </div>
                <div>
                  <strong className="block text-white font-semibold">Transparent Pricing</strong>
                  <span>Zero hidden surcharges with verified itineraries</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Promo Pill */}
          <div className="relative z-10 mt-6 pt-4 border-t border-slate-700/60 text-xs text-blue-200">
            Join over 25,000+ travelers exploring India with TripEase
          </div>
        </div>

        {/* Right Side Form (MakeMyTrip Floating Style) */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <div>
            {/* Top Toggle Switch (Sign In / Create Account) */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 max-w-xs">
              <Link 
                href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
                className="flex-1 py-1.5 px-3 text-xs font-semibold text-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <span className="flex-1 py-1.5 px-3 text-xs font-bold text-center rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs">
                Create Account
              </span>
            </div>

            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Fill in your details below to register
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe" 
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition" 
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="you@example.com" 
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition" 
                  />
                  {validatingEmail && (
                    <div className="absolute right-3 top-2.5">
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {emailWarning && emailSuggestion && emailSuggestion.toLowerCase().trim() !== form.email.toLowerCase().trim() && (
                  <div className="mt-1.5 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">{emailWarning}</p>
                    <button
                      type="button"
                      onClick={applySuggestion}
                      className="text-xs text-yellow-700 dark:text-yellow-300 hover:underline font-bold ml-2 cursor-pointer"
                    >
                      Use this
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Number with Country Code Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${
                    phone.length === 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {phone.length}/10 digits
                  </span>
                </div>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <div className="relative" ref={countryRef}>
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className={`h-[38px] bg-slate-50 dark:bg-slate-800/90 border rounded-xl px-2.5 text-xs text-slate-900 dark:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-w-[85px] justify-between ${
                        countryDropdownOpen
                          ? 'border-blue-500 ring-1 ring-blue-500'
                          : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-sm leading-none">
                          {(COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0]).flag}
                        </span>
                        <span className="font-mono text-xs">
                          {(COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0]).code}
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {countryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1 z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
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
                              className={`w-full px-3 py-2 text-xs font-medium flex items-center justify-between transition text-left cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white font-semibold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <div>
                                  <span className="font-semibold">{c.name}</span>
                                  <span className="text-[10px] opacity-75 block font-mono">{c.code}</span>
                                </div>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                        if (error.includes('mobile number')) setError('');
                      }}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono font-medium transition"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••" 
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-1.5">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                      ))}
                    </div>
                    <p className={`text-[11px] font-semibold ${strength.score >= 3 ? 'text-emerald-600 dark:text-emerald-400' : strength.score === 2 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      Strength: {strength.label}{strength.score < 3 ? ' — add uppercase, numbers or symbols' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Terms & Conditions Agreement Checkbox */}
              <div className="flex items-start gap-2 pt-0.5">
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
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
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
                  className="text-xs text-slate-600 dark:text-slate-300 leading-tight cursor-pointer select-none"
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPolicyModal('terms');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    <span>Terms of Service</span>
                    {hasReadTerms && <span className="text-emerald-500 font-bold ml-0.5">✓</span>}
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPolicyModal('privacy');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    <span>Privacy Policy</span>
                    {hasReadPrivacy && <span className="text-emerald-500 font-bold ml-0.5">✓</span>}
                  </button>.
                </label>
              </div>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2 text-xs text-rose-700 dark:text-rose-200 font-medium">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || !canSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? 'Creating account...' : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link 
                href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
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
