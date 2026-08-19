'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Heart, MapPin, Clock, Trash2, ArrowRight, Sparkles, Globe, ChevronRight } from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import Footer from '@/components/Footer';

interface WishlistItem {
  id: string;
  packageId: string;
  package: {
    id: string;
    name: string;
    destination: string;
    state: string;
    pricePerPerson: number;
    durationDays: number;
    durationNights: number;
    category: string;
    imageUrl?: string;
    shortDescription?: string;
  };
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      api.get('/api/wishlist')
        .then((res) => setItems(res.data.data || []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleRemove = async (e: React.MouseEvent, packageId: string) => {
    e.preventDefault();
    try {
      await api.delete(`/api/wishlist/${packageId}`);
      setItems((prev) => {
        const next = prev.filter((i) => i.packageId !== packageId);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { count: next.length } }));
        }
        return next;
      });
      toast.success('Removed from saved wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        {/* Top Header Banner */}
        <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white pt-28 pb-14 px-4 shadow-md">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-rose-300 mb-3">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>Saved Bucket List</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              My Saved Wishlist ({items.length})
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Your favorite dream destinations ready to be explored and booked whenever you are.
            </p>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-4 -mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl h-72 animate-pulse border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-8 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Explore our catalog and tap the heart icon to save your favorite holiday packages.
              </p>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-full transition shadow-lg shadow-blue-500/25"
              >
                <span>Browse Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {item.package.imageUrl ? (
                      <img
                        src={item.package.imageUrl}
                        alt={item.package.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Globe className="w-12 h-12" />
                      </div>
                    )}

                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                      {item.package.category}
                    </span>

                    <button
                      onClick={(e) => handleRemove(e, item.packageId)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 shadow transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {item.package.name}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {item.package.destination}, {item.package.state}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-cyan-500" />
                          {item.package.durationDays}D / {item.package.durationNights}N
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-black text-blue-600 dark:text-cyan-400">
                          ₹{item.package.pricePerPerson.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">per person</span>
                      </div>

                      <Link
                        href={`/packages/${item.package.id}`}
                        className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform"
                      >
                        <span>Book</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
