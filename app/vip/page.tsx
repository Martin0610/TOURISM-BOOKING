'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Sparkles, ShieldCheck, Crown, Tag, Phone, ArrowRight, 
  CheckCircle2, Clock, Gift, Percent, Copy, Check, Users, 
  Plane, Heart, Star, Compass, AlertCircle
} from 'lucide-react';

interface VipStatusResponse {
  isLoggedIn: boolean;
  userName?: string;
  userEmail?: string;
  isVip: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_APPLIED' | 'NOT_LOGGED_IN';
  totalSpent: number;
  targetSpend: number;
  spendProgress: number;
  confirmedBookingsCount: number;
  announcements: {
    id: string;
    title: string;
    message: string;
    couponCode?: string | null;
    discount?: string | null;
    createdAt: string;
  }[];
}

export default function VipClubPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<VipStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchVipStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/vip/status');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch {
      // Not logged in or failed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchVipStatus();
    }
  }, [user, authLoading]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please sign in to submit your VIP membership application.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/newsletter', { email: user.email });
      toast.success(res.data.message || 'VIP Application Submitted for Admin Review.');
      fetchVipStatus();
    } catch {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCoupon = (code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code ${code} copied to clipboard.`);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const isVip = data?.isVip ?? false;
  const isPending = data?.status === 'PENDING';
  const totalSpent = data?.totalSpent ?? 0;
  const targetSpend = data?.targetSpend ?? 60000;
  const progressPercent = data?.spendProgress ?? Math.min(100, Math.round((totalSpent / targetSpend) * 100));

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        
        {/* Top Hero Banner */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 z-0 opacity-25">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 rounded-full blur-[140px] pointer-events-none" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/40 px-4 py-1.5 rounded-full text-xs font-black text-amber-300 uppercase tracking-widest shadow-lg shadow-amber-500/10">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>TripEase Elite VIP Sanctuary</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Redefining Luxury Travel Across India
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Reserved for our most valued patrons. Unlock unlisted flash rates, dedicated 24/7 personal concierge support, companion passes, and curated bespoke itineraries.
            </p>
          </div>
        </section>

        {/* Live Status & Application Hub */}
        <section className="py-12 px-4 max-w-5xl mx-auto">
          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-800 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-semibold">Loading membership data...</p>
            </div>
          ) : !user ? (
            /* Guest / Not Logged In */
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Member Eligibility</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">Track Your VIP Spend & Apply</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                  Spend ₹60,000+ or complete 2+ bookings to qualify. Sign in with your TripEase account to view your live progress.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/login?redirect=/vip"
                  className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition"
                >
                  Sign In to Check Status
                </Link>
                <Link
                  href="/register"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          ) : isVip ? (
            /* Active VIP Member Card & Secret Deals Hub */
            <div className="space-y-8">
              {/* Digital Member Card */}
              <div className="bg-gradient-to-br from-[#1c180e] via-[#12131c] to-[#0a0d17] border-2 border-amber-400/50 rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30">
                      <Crown className="w-6 h-6 fill-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-widest">VIP Elite Patron</span>
                        <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white">{data?.userName || user.name}</h2>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block font-mono">ACCOUNT EMAIL</span>
                    <span className="text-xs font-bold text-slate-200 font-mono">{user.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Total Confirmed Spend</span>
                    <span className="text-lg font-black text-amber-300">₹{totalSpent.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Completed Tours</span>
                    <span className="text-lg font-black text-white">{data?.confirmedBookingsCount ?? 0} Trips</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Dedicated Concierge</span>
                    <span className="text-sm font-bold text-cyan-300 block">+91 72003 36447</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Group Booking Bonus</span>
                    <span className="text-sm font-bold text-emerald-400 block">4+1 Free & 20% Off</span>
                  </div>
                </div>
              </div>

              {/* Active Broadcast Deals Feed */}
              {data?.announcements && data.announcements.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Active VIP Broadcast Deals & Coupons
                    </h3>
                    <span className="text-xs text-amber-400 font-semibold">{data.announcements.length} Offers Available</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.announcements.map((deal) => (
                      <div key={deal.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">
                              {new Date(deal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <h4 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition">
                              {deal.title}
                            </h4>
                          </div>
                          {deal.discount && (
                            <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black px-2.5 py-1 rounded-xl whitespace-nowrap">
                              {deal.discount}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">{deal.message}</p>

                        {deal.couponCode && (
                          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase text-slate-400">Code:</span>
                              <span className="font-mono font-bold text-amber-300 bg-black/50 border border-amber-500/40 px-2 py-0.5 rounded text-xs">
                                {deal.couponCode}
                              </span>
                            </div>
                            <button
                              onClick={() => copyCoupon(deal.couponCode!)}
                              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedCode === deal.couponCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCode === deal.couponCode ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged In but Not VIP yet - Progress & Application Form */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Spend Tracker</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Your VIP Qualification Progress</h3>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block">Total Confirmed Spend</span>
                  <span className="text-xl font-black text-amber-300">₹{totalSpent.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">/ ₹{targetSpend.toLocaleString('en-IN')}</span></span>
                </div>
              </div>

              {/* Progress Bar towards 60k */}
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-400 rounded-full transition-all duration-700" 
                    style={{ width: `${Math.max(5, progressPercent)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{progressPercent}% towards ₹60,000 threshold</span>
                  <span>{totalSpent >= targetSpend ? '✓ Spending Threshold Met!' : `₹${Math.max(0, targetSpend - totalSpent).toLocaleString('en-IN')} remaining`}</span>
                </div>
              </div>

              {/* Application Status / Action Form */}
              {isPending ? (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-5 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto text-amber-300">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-amber-300">Application Under Review</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Our admin team is currently reviewing your travel booking history. You will receive an official approval email with your VIP perks once verified.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">Apply for VIP Membership</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Submit your account ({user.email}) for review by our luxury travel concierge.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>{submitting ? 'Submitting...' : 'Submit VIP Application'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>

        {/* 3 Qualification Criteria Pillars */}
        <section className="py-12 px-4 max-w-5xl mx-auto border-t border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Eligibility Rules</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">How VIP Status Is Conferred</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold">
                ₹60K
              </div>
              <h3 className="font-extrabold text-white text-base">₹60,000+ Cumulative Spend</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reach ₹60,000 in total confirmed booking value across any domestic holiday packages on TripEase.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">2+ Verified Tour Departures</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete two or more verified tours with our partner hotels, drivers, and local guides.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Direct Concierge Invitation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Patrons can apply directly through our portal or receive an invitation upon group booking completion.
              </p>
            </div>
          </div>
        </section>

        {/* 6 Elite Perks Breakdown */}
        <section className="py-16 px-4 max-w-5xl mx-auto border-t border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Privileges & Perks</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Exclusive VIP Benefits</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Secret Flash Deals</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confidential promo codes and seasonal early-bird discounts emailed straight to your inbox.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/15 text-cyan-300 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">24/7 Dedicated Concierge</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct phone & WhatsApp hotline (+91 72003 36447) with zero waiting queues for tour customization.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/15 text-emerald-300 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">4+1 Free Companion Pass</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every 4th ticket is 100% free for family & friends, plus automatic 20% group booking savings.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-400/15 text-rose-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">100% Refund Protection</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero penalty cancellation window up to 7–10 days before departure with expedited 3–5 day refunds.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-400/15 text-purple-300 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Resort Category Upgrades</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complimentary room upgrades and early check-in subject to partner luxury resort availability.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-400/15 text-indigo-300 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Instant Digital Passports</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct digital confirmation passes and verified PDF vouchers accessible anytime on your device.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Bottom Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-slate-950 to-black border-t border-slate-800 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Ready for Extraordinary Holidays?</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Explore our handpicked domestic vacation packages and embark on your next unforgettable journey.
            </p>
            <div className="pt-2">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition hover:scale-105"
              >
                <span>Browse All Holiday Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}
