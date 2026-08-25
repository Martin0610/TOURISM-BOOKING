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

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
      {/* Background — Majestic Scenic Alpine Sunset */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600" alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
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
            <p className="text-slate-400 text-sm mt-1">Create your traveler account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe" className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input type="email" value={form.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="you@example.com" className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium" />
                {validatingEmail && (
                  <div className="absolute right-3 top-3">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
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

            {/* Mobile Number with Country Code Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <span className={`text-[10px] font-mono font-bold ${
                  phone.length === 10 ? 'text-emerald-400' : 'text-amber-400'
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
                    className={`h-[42px] bg-slate-800/90 border rounded-lg px-2.5 text-xs text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-w-[90px] justify-between ${
                      countryDropdownOpen
                        ? 'border-blue-500 ring-1 ring-blue-500 bg-slate-800'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
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
                    <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 rounded-xl shadow-xl border border-slate-800 py-1 z-50 max-h-56 overflow-y-auto divide-y divide-slate-800 text-white">
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
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{c.flag}</span>
                              <div>
                                <span className="font-semibold">{c.name}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">{c.code}</span>
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
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
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
                    className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-800'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${strength.score >= 3 ? 'text-emerald-400' : strength.score === 2 ? 'text-amber-400' : 'text-rose-400'}`}>
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
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
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
                className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none"
              >
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPolicyModal('terms');
                  }}
                  className="text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer inline-flex items-center gap-0.5"
                >
                  <span>Terms of Service</span>
                  {hasReadTerms ? (
                    <span className="text-emerald-400 font-bold text-[11px] ml-0.5">✓</span>
                  ) : (
                    <span className="text-[10px] ml-1 bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-normal">Tap to read</span>
                  )}
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPolicyModal('privacy');
                  }}
                  className="text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer inline-flex items-center gap-0.5"
                >
                  <span>Privacy Policy</span>
                  {hasReadPrivacy ? (
                    <span className="text-emerald-400 font-bold text-[11px] ml-0.5">✓</span>
                  ) : (
                    <span className="text-[10px] ml-1 bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-normal">Tap to read</span>
                  )}
                </button>.
              </label>
            </div>

            {error && <div className="bg-rose-950/60 border border-rose-800 rounded-lg px-3.5 py-2.5 text-xs text-rose-200 font-medium">{error}</div>}

            <button type="submit" disabled={loading || !canSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm">
              {loading ? 'Creating account...' : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
            </button>
            {!canSubmit && form.password.length > 0 && strength.score < 3 && (
              <p className="text-xs text-center text-amber-400 font-medium">Improve password strength to enable signup</p>
            )}
            {!canSubmit && form.password.length > 0 && strength.score >= 3 && !agreeTerms && (
              <p className="text-xs text-center text-slate-400 font-medium">
                {!hasReadTerms || !hasReadPrivacy ? 'Please read the Terms & Privacy Policy to enable agreement' : 'Please tick the box above to accept the Terms & Conditions'}
              </p>
            )}
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors">Sign in</Link>
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
