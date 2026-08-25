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
        {/* Header Banner - Clean Light Cohesive Flow */}
        <section className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white pt-28 pb-10 px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-1 rounded-full text-xs font-medium text-rose-700 dark:text-rose-300 mb-2.5">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Saved Bucket List</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              My Saved Wishlist ({items.length})
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Your favorite dream destinations ready to be explored and booked whenever you are.
            </p>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-4 pt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl h-64 animate-pulse border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                Explore our catalog and tap the heart icon to save your favorite holiday packages.
              </p>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition shadow-sm"
              >
                <span>Browse Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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

                    <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 shadow-sm">
                      {item.package.category}
                    </span>

                    <button
                      onClick={(e) => handleRemove(e, item.packageId)}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 shadow-xs transition cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {item.package.name}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-2.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {item.package.destination}, {item.package.state}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          {item.package.durationDays}D / {item.package.durationNights}N
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          ₹{item.package.pricePerPerson.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">per person</span>
                      </div>

                      <Link
                        href={`/packages/${item.package.id}`}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
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
