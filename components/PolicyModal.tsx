'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, ShieldCheck, FileText, RotateCcw, CheckCircle2, Lock, Phone, ChevronDown, Check } from 'lucide-react';

export type PolicyType = 'terms' | 'privacy' | 'cancellation' | null;

interface PolicyModalProps {
  type: PolicyType;
  onClose: () => void;
}

export default function PolicyModal({ type, onClose }: PolicyModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll state when modal opens or policy type changes
  useEffect(() => {
    setHasScrolledToBottom(false);
    if (type) {
      document.body.style.overflow = 'hidden';
      // Check if content fits in viewport without needing scrolling
      const timer = setTimeout(() => {
        if (contentRef.current) {
          const { scrollHeight, clientHeight } = contentRef.current;
          if (scrollHeight <= clientHeight + 20) {
            setHasScrolledToBottom(true);
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [type]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [type, onClose]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // Trigger when within 30px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 30) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setHasScrolledToBottom(true);
    }
  };

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in cursor-pointer" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              {type === 'terms' && <FileText className="w-5 h-5" />}
              {type === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {type === 'cancellation' && <RotateCcw className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {type === 'terms' && 'Terms of Service'}
                {type === 'privacy' && 'Privacy Policy'}
                {type === 'cancellation' && 'Cancellation & Refund Guarantee'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                TripEase Holidays • Last Updated August 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body with scroll listener */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="p-6 overflow-y-auto space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-[55vh]"
        >
          {type === 'terms' && (
            <>
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-200 font-medium">
                Welcome to TripEase. By accessing our platform, booking packages, or registering an account, you agree to comply with the following contractual terms.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1. Booking & Account Agreement
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Users must provide accurate, verified information during registration. Bookings are confirmed upon valid payment confirmation via our authorized payment partner Razorpay. Instant digital trip vouchers will be generated in your account dashboard.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2. Special Offers & Discounts
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Group discounts (e.g., 20% off for 3+ passengers) and the 4+1 Free Ticket promotion are automatically computed based on adult headcount. Only one promo coupon can be combined per checkout transaction.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 3. Departure & Transit Arrangements
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Multi-city departures via Flight, Train, or AC Bus are operated by verified transit partners. Travelers must arrive at the designated departure hub 2 hours before scheduled departure times with valid government photo identification.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 4. Traveler Conduct & Responsibilities
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Travelers agree to abide by local cultural, state, and national park regulations. TripEase reserves the right to cancel bookings without refund in instances of misconduct or safety violations.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 5. Modifications & Amendments
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  TripEase reserves the right to update these terms at any time. Continued usage of the platform constitutes acceptance of the latest revised terms.
                </p>
              </div>
            </>
          )}

          {type === 'privacy' && (
            <>
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-200 font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Your privacy and data security are our top priority. We never sell or share your personal data with third-party advertisers.</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1. Data Collection & Purpose
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We collect your name, email address, contact phone number, and booking travel preferences strictly to fulfill your tourism bookings, generate digital tickets, and provide 24/7 customer support.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2. Bank-Grade Payment Security
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Payment processing is secured via Razorpay PCI-DSS Level 1 compliant tokenized gateway. TripEase never stores card numbers, CVVs, or NetBanking credentials on our database servers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 3. Account Protection & Encryption
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All user passwords are cryptographically hashed using industry-standard bcrypt. Session tokens are encrypted and transmitted exclusively over secure HTTPS protocols.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 4. Data Retention & User Rights
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You have the right to request deletion of your account history and associated booking metadata at any time by contacting our privacy compliance team.
                </p>
              </div>
            </>
          )}

          {type === 'cancellation' && (
            <>
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 font-medium">
                TripEase provides a transparent, guaranteed cancellation policy designed to give you complete peace of mind while planning your holidays.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1. 100% Free Cancellation Window
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cancel up to <strong>7 to 10 days</strong> before your scheduled trip departure date and receive a <strong>100% full refund</strong> with zero cancellation penalties or hidden processing deductions.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2. Partial Refund (3 to 7 Days)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cancellations requested between 3 and 7 days prior to departure qualify for a <strong>50% refund</strong> of the package booking value, with the remainder allocated towards pre-reserved accommodations.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 3. Fast Automated Refund Processing
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Refunds are authorized immediately upon cancellation and credited directly back to your original payment source (UPI / NetBanking / Card) within <strong>5 to 7 business days</strong>.
                </p>
              </div>
            </>
          )}

          {/* Concierge Help box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Have questions about this policy?</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Our customer support team is available 24/7.</p>
            </div>
            <a 
              href="tel:+917200336447"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
            >
              <Phone className="w-3 h-3" /> Call +91 72003 36447
            </a>
          </div>
        </div>

        {/* Footer actions with scroll-to-bottom requirement */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {!hasScrolledToBottom ? (
              <button
                type="button"
                onClick={scrollToBottom}
                className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer animate-pulse"
              >
                <ChevronDown className="w-4 h-4" /> Please scroll down to the bottom to continue
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Policy completely read & reviewed
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            disabled={!hasScrolledToBottom}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-2 ${
              hasScrolledToBottom
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer shadow-black/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            {hasScrolledToBottom ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>I Understand & Exit</span>
              </>
            ) : (
              <span>Scroll to Enable Exit</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
