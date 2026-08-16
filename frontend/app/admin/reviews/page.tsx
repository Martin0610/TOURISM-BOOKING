'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { Star, Trash2 } from 'lucide-react';

interface AdminReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name: string; email: string };
  package: { name: string };
}

export default function AdminReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<AdminReview[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') {
      api.get('/api/admin/reviews').then(r => setReviews(r.data.data));
    }
  }, [user, authLoading]);

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/api/admin/reviews/${id}`);
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success('Review deleted');
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-2xl font-bold text-gray-800">
          Customer Reviews
          <span className="ml-2 text-base font-normal text-gray-400">({reviews.length})</span>
        </h2>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400">No reviews yet.</div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{r.user.name}</span>
                      <span className="text-gray-400 text-xs">• {r.user.email}</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-2">Package: {r.package.name}</p>
                    {r.comment && <p className="text-gray-700 text-sm">{r.comment}</p>}
                    <p className="text-gray-400 text-xs mt-2">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors ml-4"
                    title="Delete Review">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
