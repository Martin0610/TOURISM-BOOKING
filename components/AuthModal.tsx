'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Compass, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, 
  ChevronDown, Check, X, Sparkles, AlertCircle 
} from 'lucide-react';
import PolicyModal, { PolicyType } from '@/components/PolicyModal';
import { COUNTRY_CODES, formatPhoneNumber, parsePhoneNumber } from '@/lib/countryCodes';
import { getAuthUser } from '@/lib/authStorage';

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

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  redirectUrl?: string | null;
}

export default function AuthModal({ isOpen, initialMode = 'login', onClose, redirectUrl }: AuthModalProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regPhone, setRegPhone] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regError, setRegError] = useState('');
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

  const strength = getPasswordStrength(regForm.password);
  const canSubmitRegister = regForm.name && regForm.email && regForm.password && regPhone.replace(/\D/g, '').length === 10 && strength.score >= 3 && agreeTerms;
  const canSubmitLogin = loginEmail.trim().length > 0 && loginPassword.length >= 6;

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim());
    if (!isValidEmail) {
      setLoginError('Please enter a valid email address (e.g. name@example.com)');
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters long.');
      return;
    }

    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail.trim().toLowerCase(), loginPassword);
      const user = getAuthUser();
      if (user?.phone && typeof window !== 'undefined') {
        localStorage.setItem('saved_phone', user.phone);
        const parsed = parsePhoneNumber(user.phone);
        sessionStorage.setItem('last_entered_phone', parsed.number);
      }
      onClose();
      if (user) {
        if (redirectUrl && redirectUrl.startsWith('/') && redirectUrl !== '/login' && redirectUrl !== '/register' && redirectUrl !== '/') {
          router.push(redirectUrl);
        } else if (typeof window !== 'undefined' && window.location.pathname.startsWith('/packages/')) {
          // Stay on the package page, all entered details are intact!
        } else if (user.role === 'ADMIN' && typeof window !== 'undefined' && window.location.pathname === '/login') {
          router.push('/admin');
        } else if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
          router.push('/');
        }
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invalid email or password. Please try again.';
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

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
        setRegError(data.message);
      } else {
        setRegError('');
        if (data.suggestion && data.suggestion.toLowerCase().trim() !== email.toLowerCase().trim()) {
          setEmailSuggestion(data.suggestion);
          setEmailWarning(data.warning || `Did you mean ${data.suggestion}?`);
        }
      }
    } catch {
      // ignore
    } finally {
      setValidatingEmail(false);
    }
  };

  const handleEmailChange = (email: string) => {
    setRegForm({ ...regForm, email: email.toLowerCase() });
    setEmailWarning('');
    setEmailSuggestion('');
    const timeoutId = setTimeout(() => validateEmail(email), 800);
    return () => clearTimeout(timeoutId);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password.length < 6) { setRegError('Password must be at least 6 characters long.'); return; }
    if (strength.score < 3) { setRegError('Please choose a stronger password before signing up.'); return; }
    if (!agreeTerms) { setRegError('Please read and tick the box to agree to the Terms of Service & Privacy Policy.'); return; }
    
    const digits = regPhone.replace(/\D/g, '');
    if (!digits || digits.length !== 10) {
      setRegError(`Please enter a valid 10-digit mobile number (${digits ? digits.length : 0}/10 digits entered).`);
      return;
    }

    setRegError('');
    setRegLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(regCountryCode, digits);
      if (typeof window !== 'undefined') {
        localStorage.setItem('saved_phone', formattedPhone);
        sessionStorage.setItem('last_entered_phone', digits);
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.name,
          email: regForm.email.toLowerCase().trim(),
          password: regForm.password,
          phone: formattedPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onClose();
      router.push(`/verify-email?email=${encodeURIComponent(regForm.email)}`);
    } catch (err: unknown) {
      setRegError((err as Error).message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const handlePolicyAccept = (acceptedType: PolicyType) => {
    if (acceptedType === 'terms') {
      setHasReadTerms(true);
      if (!hasReadPrivacy) {
        toast.success('Terms of Service reviewed. Opening Privacy Policy...', { duration: 3000 });
        setTimeout(() => setPolicyModal('privacy'), 400);
      } else {
        setAgreeTerms(true);
        if (regError.includes('Terms')) setRegError('');
        toast.success('Agreements confirmed and accepted.', { duration: 3000 });
      }
    } else if (acceptedType === 'privacy') {
      setHasReadPrivacy(true);
      if (!hasReadTerms) {
        toast.success('Privacy Policy reviewed. Opening Terms of Service...', { duration: 3000 });
        setTimeout(() => setPolicyModal('terms'), 400);
      } else {
        setAgreeTerms(true);
        if (regError.includes('Terms')) setRegError('');
        toast.success('Agreements confirmed and accepted.', { duration: 3000 });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Crisp Background Dimmer */}
      <div 
        className="fixed inset-0 bg-black/40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Floating Minimalist Auth Card */}
      <div className="relative z-10 w-full max-w-md max-h-[92vh] overflow-y-auto no-scrollbar bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                TripEase
              </span>
              <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-0.5">
                Explore India
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Minimalist Perks Pill */}
        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl px-3 py-1.5 mb-5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="truncate">4+1 Free Ticket · 20% Group Pass · ₹0 Fee</span>
        </div>

        {mode === 'login' ? (
          /* --- SIGN IN FORM --- */
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sign in to access your bookings & group savings
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5" noValidate>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value.toLowerCase());
                      if (loginError) setLoginError('');
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    onClick={onClose}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={loginShowPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setLoginShowPassword(!loginShowPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                    aria-label={loginShowPassword ? "Hide password" : "Show password"}
                  >
                    {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl p-2.5 text-xs text-rose-700 dark:text-rose-200 font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">
                    {loginError}
                    {loginError.includes('verify your email') && (
                      <Link 
                        href={`/verify-email?email=${encodeURIComponent(loginEmail)}`}
                        onClick={onClose}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold block mt-1"
                      >
                        Enter OTP →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loginLoading || !canSubmitLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loginLoading ? 'Signing in...' : (<>Sign In <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          </div>
        ) : (
          /* --- REGISTER FORM --- */
          <div>
            <div className="mb-3.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Join TripEase for group discounts & instant vouchers
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3" noValidate>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={regForm.name} 
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="John Doe" 
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={regForm.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="you@example.com" 
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition" 
                  />
                  {validatingEmail && (
                    <div className="absolute right-3 top-2.5">
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {emailWarning && emailSuggestion && emailSuggestion.toLowerCase().trim() !== regForm.email.toLowerCase().trim() && (
                  <div className="mt-1 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-800 rounded-lg px-2.5 py-1 flex items-center justify-between">
                    <p className="text-[11px] text-yellow-800 dark:text-yellow-200">{emailWarning}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setRegForm({ ...regForm, email: emailSuggestion });
                        setEmailSuggestion('');
                        setEmailWarning('');
                      }}
                      className="text-[11px] text-yellow-700 dark:text-yellow-300 hover:underline font-bold ml-2 cursor-pointer"
                    >
                      Use this
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${
                    regPhone.length === 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {regPhone.length}/10 digits
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative" ref={countryRef}>
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className={`h-[38px] bg-slate-50 dark:bg-slate-800/90 border rounded-xl px-2.5 text-xs text-slate-900 dark:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-w-[80px] justify-between ${
                        countryDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-sm leading-none">
                          {(COUNTRY_CODES.find((c) => c.code === regCountryCode) || COUNTRY_CODES[0]).flag}
                        </span>
                        <span className="font-mono text-xs">
                          {(COUNTRY_CODES.find((c) => c.code === regCountryCode) || COUNTRY_CODES[0]).code}
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {countryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1 z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {COUNTRY_CODES.map((c) => {
                          const isSelected = regCountryCode === c.code;
                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setRegCountryCode(c.code);
                                setCountryDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-1.5 text-xs font-medium flex items-center justify-between transition text-left cursor-pointer ${
                                isSelected ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                      value={regPhone}
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setRegPhone(val);
                        if (regError.includes('mobile number')) setRegError('');
                      }}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono font-medium transition"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type={regShowPassword ? 'text' : 'password'} 
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="••••••••" 
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                    aria-label={regShowPassword ? "Hide password" : "Show password"}
                  >
                    {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {regForm.password.length > 0 && (
                  <div className="mt-1.5">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-800'}`} />
                      ))}
                    </div>
                    <p className={`text-[10px] font-semibold ${strength.score >= 3 ? 'text-emerald-600 dark:text-emerald-400' : strength.score === 2 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      Strength: {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Terms & Privacy */}
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
                    if (e.target.checked && regError.includes('Terms')) setRegError('');
                  }}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
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
                  className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight cursor-pointer select-none"
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
                    <span>Terms</span>
                    {hasReadTerms && <span className="text-emerald-500 font-bold ml-0.5">✓</span>}
                  </button>{' '}
                  &{' '}
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

              {regError && (
                <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-1.5 text-xs text-rose-700 dark:text-rose-200 font-medium">
                  {regError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={regLoading || !canSubmitRegister}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {regLoading ? 'Creating account...' : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          </div>
        )}

        {/* Minimalist Switch Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          {mode === 'login' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>

      <PolicyModal 
        type={policyModal} 
        onClose={() => setPolicyModal(null)} 
        onAccept={handlePolicyAccept}
      />
    </div>
  );
}
