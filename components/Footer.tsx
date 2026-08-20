'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, Shield, CreditCard, Sparkles, Phone, ShieldCheck, ArrowRight, Mail } from 'lucide-react';
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
  const [vipInfo, setVipInfo] = useState<{ isVip: boolean; status: string; totalSpent: number } | null>(null);

  // Fetch VIP status for logged-in user
  useEffect(() => {
    if (user && localStorage.getItem('token')) {
      api.get('/api/vip/status')
        .then((res) => {
          if (res.data?.data) {
            setVipInfo(res.data.data);
            if (!res.data.data.isVip && user.email) {
              setNewsletterEmail(user.email);
            } else if (res.data.data.isVip) {
              setNewsletterEmail('');
            }
          }
        })
        .catch(() => {
          if (user?.email) setNewsletterEmail(user.email);
        });
    } else {
      setVipInfo(null);
      setNewsletterEmail('');
    }
  }, [user]);

  // Auto-scroll to VIP club if returning from login with #vip-club hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scrollDown = () => {
        if (window.location.hash === '#vip-club' || window.location.hash === '#footer') {
          const el = document.getElementById('vip-club') || document.getElementById('footer');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      };

      scrollDown();
      const timer = setTimeout(scrollDown, 400);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not logged in, redirect to login page and return directly back to the VIP section at the bottom
    if (!user) {
      toast('Please sign in with your account to apply for VIP Club membership.');
      const currentUrl = pathname || '/';
      const emailQuery = newsletterEmail.trim() ? `&email=${encodeURIComponent(newsletterEmail.trim())}` : '';
      router.push(`/login?redirect=${encodeURIComponent(currentUrl + '#vip-club')}${emailQuery}`);
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
      toast.success(res.data.message || 'VIP Club Application Submitted.', { duration: 4000 });
      setVipInfo((prev) => prev ? { ...prev, status: 'PENDING' } : { isVip: false, status: 'PENDING', totalSpent: 0 });
      setNewsletterEmail('');
    } catch {
      toast.error('Failed to submit VIP application. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <footer id="footer" className="bg-slate-950 text-slate-400 pt-16 pb-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Col 1: Brand info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
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
            <div id="vip-club">
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
              ) : vipInfo?.isVip || vipInfo?.status === 'APPROVED' || user?.isVip || user?.vipStatus === 'APPROVED' ? (
                /* Already Approved VIP Member - Do not show email form */
                <div className="space-y-3 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-slate-950" /> VIP Elite Member
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your VIP privileges, 24/7 dedicated concierge, and confidential flash discounts are fully unlocked.
                  </p>
                  <Link
                    href="/vip"
                    className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 transition shadow-sm"
                  >
                    <span>Open VIP Hub & Privileges</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : vipInfo?.status === 'PENDING' || user?.vipStatus === 'PENDING' ? (
                /* Application Already Submitted & Under Review - No email input */
                <div className="space-y-3 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-400/30 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> VIP Under Review
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold">Pending</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your VIP membership application is currently under review by our luxury travel concierge.
                  </p>
                  <Link
                    href="/vip"
                    className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 transition"
                  >
                    <span>Track Status in VIP Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                /* Non-VIP / Guest Applicant - Form only shown if not applied yet */
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" /> VIP Travel Club
                    </h4>
                    <Link href="/vip" className="text-[11px] text-amber-400 hover:underline font-bold">
                      View Perks →
                    </Link>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Spend <span className="text-amber-300 font-semibold">₹60,000+</span> across bookings to qualify for VIP Elite status, secret flash sales & tier discounts. Approved by admin based on travel history.
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
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-sm shadow-amber-500/20"
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
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=mjv3140@gmail.com&su=${encodeURIComponent('Customer Support & Inquiry - TripEase Holidays')}&body=${encodeURIComponent('Hi TripEase Support Team,\n\nI am reaching out regarding:\n\n[Please enter your inquiry here]\n\nRegards,')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white hover:underline transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-400" /> mjv3140@gmail.com
                </a>
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
