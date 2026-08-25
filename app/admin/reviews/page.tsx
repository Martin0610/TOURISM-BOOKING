'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import ConfirmDialog from '@/components/ConfirmDialog';
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
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') {
      api.get('/api/admin/reviews').then(r => setReviews(r.data.data));
    }
  }, [user, authLoading]);

  const deleteReview = async () => {
    if (!confirmId) return;
    await api.delete(`/api/admin/reviews/${confirmId}`);
    setReviews(prev => prev.filter(r => r.id !== confirmId));
    setConfirmId(null);
    toast.success('Review deleted');
  };

  return (
    <AdminLayout>
      <ConfirmDialog
        open={!!confirmId}
        title="Delete Review"
        message="Are you sure you want to delete this review? This cannot be undone."
        confirmLabel="Yes, Delete"
        onConfirm={deleteReview}
        onCancel={() => setConfirmId(null)}
      />
      <div className="space-y-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Customer Reviews
          <span className="ml-2 text-sm font-normal text-slate-400">({reviews.length})</span>
        </h2>

        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-10 text-center text-slate-400 border border-slate-200 dark:border-slate-800 text-xs">No reviews yet.</div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                        ))}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{r.user.name}</span>
                      <span className="text-slate-400 text-xs">• {r.user.email}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-2">Package: <span className="font-medium text-slate-700 dark:text-slate-300">{r.package.name}</span></p>
                    {r.comment && <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm">{r.comment}</p>}
                    <p className="text-slate-400 text-[11px] mt-2">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => setConfirmId(r.id)}
                    className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 p-2 rounded-lg transition-colors ml-4 cursor-pointer"
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
