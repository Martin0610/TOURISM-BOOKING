'use client';

import { MessageCircle, Sparkles } from 'lucide-react';

export default function WhatsAppButton() {
  const openWhatsApp = () => {
    window.open('https://wa.me/917200336447?text=Hi!%20I%20have%20a%20query%20about%20TripEase%20packages.', '_blank');
  };

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-12 right-6 sm:bottom-14 sm:right-8 z-40 flex items-center gap-2.5">
      {/* Live Support Text Pill */}
      <button
        onClick={openWhatsApp}
        className="hidden md:flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md shadow-xl rounded-full pl-3.5 pr-4 py-2 border border-white/20 text-xs font-semibold hover:scale-105 transition-all"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span>24/7 Support</span>
      </button>

      {/* Floating WhatsApp Action Button */}
      <button
        onClick={openWhatsApp}
        className="relative bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-3.5 shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Chat with 24/7 Support on WhatsApp"
        title="Chat with 24/7 Support on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60 pointer-events-none" />
        <MessageCircle className="w-6 h-6 relative z-10" />
      </button>
    </aside>
  );
}
