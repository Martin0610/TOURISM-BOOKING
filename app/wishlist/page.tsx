'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Heart, MapPin, Clock, Trash2 } from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';

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
  };
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      api.get('/api/wishlist').then(res => setItems(res.data.data)).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const handleRemove = async (packageId: string) => {
    try {
      await api.delete(`/api/wishlist/${packageId}`);
      setItems(prev => prev.filter(i => i.packageId !== packageId));
    } catch { /* ignore */ }
  };

  return (
    <>
      <Navbar />
      <WhatsAppButton />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" /> My Wishlist
          </h1>
          <p className="text-gray-500 mb-8">Packages you've saved for later</p>

          {loading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg mb-4">Your wishlist is empty.</p>
              <Link href="/packages" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition">Browse Packages</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map(item => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="h-40 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 relative">
                    {item.package.imageUrl && <img src={item.package.imageUrl} alt={item.package.name} className="w-full h-full object-cover" />}
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{item.package.category}</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white mb-1">{item.package.name}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.package.destination}, {item.package.state}</p>
                      <p className="text-gray-400 text-xs mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{item.package.durationDays}D / {item.package.durationNights}N</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold text-lg">₹{item.package.pricePerPerson.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-400">/person</span></span>
                      <div className="flex gap-2">
                        <Link href={`/packages/${item.package.id}`} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg text-sm hover:from-purple-700 hover:to-pink-700 transition">Book</Link>
                        <button onClick={() => handleRemove(item.packageId)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
