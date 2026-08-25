'use client';

import { Compass, Sparkles, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function StaticHomeBackdrop() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none -z-10 bg-slate-950">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Visual Scene */}
      <div className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-4 bg-gradient-to-b from-[#021B2B] via-[#06334F] to-[#02131F]">
        <img
          src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=90"
          alt="Goa Coastal"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.70]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/90" />

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white pt-6">
          {/* Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4 opacity-90">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white border border-blue-400">
              Goa Coastal
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-slate-200 border border-white/15">
              Kashmir Valleys
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-slate-200 border border-white/15">
              Kerala Lagoons
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-4 text-white">
            Discover The Soul Of India,<br />
            <span className="text-blue-300">One Journey At A Time</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto mb-6">
            Handcrafted holiday packages across India with verified stays, flexible departures, and transparent all-inclusive pricing.
          </p>

          {/* Search Box Mock */}
          <div className="max-w-2xl mx-auto bg-white/95 dark:bg-slate-900/95 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2 px-2 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Where to? (Goa, Manali, Kerala...)</span>
            </div>
            <div className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
              Search
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
