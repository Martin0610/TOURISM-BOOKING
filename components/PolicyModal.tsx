'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, ShieldCheck, FileText, RotateCcw, CheckCircle2, Lock, Phone, ChevronDown, Check, Sparkles } from 'lucide-react';

export type PolicyType = 'terms' | 'privacy' | 'cancellation' | null;

interface PolicyModalProps {
  type: PolicyType;
  onClose: () => void;
  onAccept?: (type: PolicyType) => void;
}

export default function PolicyModal({ type, onClose, onAccept }: PolicyModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeType, setActiveType] = useState<PolicyType>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Smooth entrance & exit animations
  useEffect(() => {
    if (type) {
      setActiveType(type);
      setHasScrolledToBottom(false);
      document.body.style.overflow = 'hidden';
      
      // Gentle bloom animation frame
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // Check if content fits in viewport without scrolling
      const timer = setTimeout(() => {
        if (contentRef.current) {
          const { scrollHeight, clientHeight } = contentRef.current;
          if (scrollHeight <= clientHeight + 30) {
            setHasScrolledToBottom(true);
          }
        }
      }, 350);

      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setActiveType(null);
        document.body.style.overflow = 'unset';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [type]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 280);
  };

  const handleAcceptAndExit = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onAccept && activeType) onAccept(activeType);
      onClose();
    }, 280);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (activeType) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeType]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 35) {
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

  if (!activeType) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Soft, gentle backdrop with smooth fade-in */}
      <div 
        onClick={handleClose} 
        className={`absolute inset-0 bg-slate-950/70 backdrop-blur-lg transition-all duration-400 ease-out cursor-pointer ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
      />

      {/* Elegant, soft-blooming modal card */}
      <div 
        className={`relative w-full max-w-2xl bg-slate-900/95 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col max-h-[85vh] z-10 text-white transition-all duration-400 ease-out transform ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-8'
        }`}
      >
        {/* Header with Royal Purple branding */}
        <div className="px-6 py-5 border-b border-purple-500/20 flex items-center justify-between bg-purple-950/30 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 ring-1 ring-white/20">
              {activeType === 'terms' && <FileText className="w-5 h-5" />}
              {activeType === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {activeType === 'cancellation' && <RotateCcw className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <span>
                  {activeType === 'terms' && 'Terms of Service'}
                  {activeType === 'privacy' && 'Privacy Policy'}
                  {activeType === 'cancellation' && 'Cancellation & Refund Guarantee'}
                </span>
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              </h3>
              <p className="text-xs text-purple-200/80">
                TripEase Holidays • Last Updated August 2026
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="p-6 overflow-y-auto space-y-5 text-sm text-slate-200 leading-relaxed max-h-[55vh] selection:bg-purple-500 selection:text-white"
        >
          {activeType === 'terms' && (
            <>
              <div className="p-4 bg-purple-500/15 rounded-2xl border border-purple-400/30 text-xs text-purple-100 font-medium">
                Welcome to TripEase. By accessing our platform, booking packages, or registering an account, you agree to comply with the following contractual terms.
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 1. Booking & Account Agreement
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Users must provide accurate, verified information during registration. Bookings are confirmed upon valid payment confirmation via our authorized payment partner Razorpay. Instant digital trip vouchers will be generated in your account dashboard.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 2. Special Offers & Discounts
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Group discounts (e.g., 20% off for 3+ passengers) and the 4+1 Free Ticket promotion are automatically computed based on adult headcount. Only one promo coupon can be combined per checkout transaction.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 3. Departure & Transit Arrangements
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Multi-city departures via Flight, Train, or AC Bus are operated by verified transit partners. Travelers must arrive at the designated departure hub 2 hours before scheduled departure times with valid government photo identification.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 4. Traveler Conduct & Responsibilities
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Travelers agree to abide by local cultural, state, and national park regulations. TripEase reserves the right to cancel bookings without refund in instances of misconduct or safety violations.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 5. Modifications & Amendments
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  TripEase reserves the right to update these terms at any time. Continued usage of the platform constitutes acceptance of the latest revised terms.
                </p>
              </div>
            </>
          )}

          {activeType === 'privacy' && (
            <>
              <div className="p-4 bg-emerald-500/15 rounded-2xl border border-emerald-400/30 text-xs text-emerald-200 font-medium flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Your privacy and data security are our top priority. We never sell or share your personal data with third-party advertisers.</span>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 1. Data Collection & Purpose
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  We collect your name, email address, contact phone number, and booking travel preferences strictly to fulfill your tourism bookings, generate digital tickets, and provide 24/7 customer support.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 2. Bank-Grade Payment Security
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Payment processing is secured via Razorpay PCI-DSS Level 1 compliant tokenized gateway. TripEase never stores card numbers, CVVs, or NetBanking credentials on our database servers.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 3. Account Protection & Encryption
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  All user passwords are cryptographically hashed using industry-standard bcrypt. Session tokens are encrypted and transmitted exclusively over secure HTTPS protocols.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 4. Data Retention & User Rights
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  You have the right to request deletion of your account history and associated booking metadata at any time by contacting our privacy compliance team.
                </p>
              </div>
            </>
          )}

          {activeType === 'cancellation' && (
            <>
              <div className="p-4 bg-amber-500/15 rounded-2xl border border-amber-400/30 text-xs text-amber-200 font-medium">
                TripEase provides a transparent, guaranteed cancellation policy designed to give you complete peace of mind while planning your holidays.
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 1. 100% Free Cancellation Window
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Cancel up to <strong>7 to 10 days</strong> before your scheduled trip departure date and receive a <strong>100% full refund</strong> with zero cancellation penalties or hidden processing deductions.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 2. Partial Refund (3 to 7 Days)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Cancellations requested between 3 and 7 days prior to departure qualify for a <strong>50% refund</strong> of the package booking value, with the remainder allocated towards pre-reserved accommodations.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 3. Fast Automated Refund Processing
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  Refunds are authorized immediately upon cancellation and credited directly back to your original payment source (UPI / NetBanking / Card) within <strong>5 to 7 business days</strong>.
                </p>
              </div>
            </>
          )}

          {/* Concierge Help box */}
          <div className="p-4 bg-purple-950/40 rounded-2xl border border-purple-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Have questions about this policy?</p>
              <p className="text-[11px] text-purple-200/70">Our customer support concierge is available 24/7.</p>
            </div>
            <a 
              href="tel:+917200336447"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" /> Call Concierge
            </a>
          </div>
        </div>

        {/* Footer actions with smooth scroll-to-bottom indicator */}
        <div className="px-6 py-4 border-t border-purple-500/20 bg-purple-950/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {!hasScrolledToBottom ? (
              <button
                type="button"
                onClick={scrollToBottom}
                className="inline-flex items-center gap-1.5 text-amber-300 font-medium hover:underline cursor-pointer transition-colors"
              >
                <ChevronDown className="w-4 h-4 animate-bounce" /> Please scroll down to the bottom to continue
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Policy completely read & reviewed
              </span>
            )}
          </div>

          <button
            onClick={handleAcceptAndExit}
            disabled={!hasScrolledToBottom}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer ${
              hasScrolledToBottom
                ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:scale-105 active:scale-95'
                : 'bg-white/10 text-white/40 cursor-not-allowed opacity-50'
            }`}
          >
            {hasScrolledToBottom ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 font-bold" />
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
