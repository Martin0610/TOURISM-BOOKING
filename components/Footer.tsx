'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, Shield, CreditCard, Sparkles, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import PolicyModal, { PolicyType } from './PolicyModal';

export default function Footer() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [policyModal, setPolicyModal] = useState<PolicyType>(null);

  // Auto-fill logged-in user email
  useEffect(() => {
    if (user?.email && !newsletterEmail) {
      setNewsletterEmail(user.email);
    }
  }, [user]);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not logged in, redirect to login page and return back to this page
    if (!user) {
      toast('Please sign in to apply for VIP Club membership.', { icon: '🔐' });
      const currentUrl = pathname || '/';
      const emailQuery = newsletterEmail.trim() ? `&email=${encodeURIComponent(newsletterEmail.trim())}` : '';
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}${emailQuery}`);
      return;
    }

    const emailToSend = (newsletterEmail.trim() || user.email).toLowerCase();
    if (!emailToSend || !emailToSend.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSubscribing(true);
      const res = await api.post('/api/newsletter', { email: emailToSend });
      toast.success(res.data.message || 'VIP Club Application Submitted! 🎉', { duration: 4000 });
      if (!user) setNewsletterEmail('');
    } catch {
      toast.error('Failed to submit VIP application. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Col 1: Brand info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-2xl text-white tracking-tight">
                  TripEase
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                India&apos;s premier travel booking engine. Offering curated vacation packages with multi-city departures, group savings, and instant digital vouchers.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-400" /> Razorpay Verified</span>
                <span className="flex items-center gap-1"><CreditCard className="w-4 h-4 text-cyan-400" /> UPI & NetBanking</span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                <li><Link href="/packages" className="hover:text-white transition">Tourism Packages</Link></li>
                {user?.role === 'ADMIN' ? (
                  <>
                    <li><Link href="/admin/packages" className="hover:text-white transition">Manage Packages</Link></li>
                    <li><Link href="/admin/bookings" className="hover:text-white transition">Manage Bookings</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/wishlist" className="hover:text-white transition">My Wishlist</Link></li>
                    <li><Link href="/my-bookings" className="hover:text-white transition">My Bookings</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Col 3: Popular Escapes */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Popular Escapes</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/packages?category=Beach" className="hover:text-white transition">Goa & Andamans</Link></li>
                <li><Link href="/packages?category=Hill+Station" className="hover:text-white transition">Kashmir & Manali</Link></li>
                <li><Link href="/packages?category=Heritage" className="hover:text-white transition">Rajasthan Royal Tour</Link></li>
                <li><Link href="/packages?category=Nature" className="hover:text-white transition">Kerala Backwaters</Link></li>
              </ul>
            </div>

            {/* Col 4: VIP Club Application / Contact (or Admin Control Hub for Admin) */}
            <div>
              {user?.role === 'ADMIN' ? (
                <div className="space-y-2.5">
                  <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" /> Admin Control Hub
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Manage portal bookings, approve VIP memberships, and broadcast travel deals.
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      href="/admin/vip"
                      className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> VIP Portal & Deals
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/admin"
                      className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
                    >
                      <span>Dashboard & Bookings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> VIP Travel Club
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Apply for VIP Club status to unlock secret flash sales & tier discounts. Approved by admin based on your travel history.
                  </p>
                  <form onSubmit={handleNewsletter} className="flex gap-1.5">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Your account email..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={subscribing || !newsletterEmail}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      {subscribing ? 'Applying...' : 'Apply VIP'}
                    </button>
                  </form>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1 text-xs">
                <a href="tel:+917200336447" className="flex items-center gap-1.5 text-cyan-400 hover:underline">
                  <Phone className="w-3.5 h-3.5" /> +91 72003 36447
                </a>
                <p className="text-slate-500">mjv3140@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 sm:pr-40 pr-0">
            <p>© 2026 TripEase Holidays Pvt. Ltd. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-6">
              <button 
                type="button" 
                onClick={() => setPolicyModal('terms')} 
                className="hover:text-slate-300 transition cursor-pointer underline-offset-4 hover:underline"
              >
                Terms of Service
              </button>
              <button 
                type="button" 
                onClick={() => setPolicyModal('privacy')} 
                className="hover:text-slate-300 transition cursor-pointer underline-offset-4 hover:underline"
              >
                Privacy Policy
              </button>
              <button 
                type="button" 
                onClick={() => setPolicyModal('cancellation')} 
                className="hover:text-slate-300 transition cursor-pointer underline-offset-4 hover:underline"
              >
                Cancellation Guarantee
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Read & Exit Policy Modal Overlay */}
      <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />
    </>
  );
}
