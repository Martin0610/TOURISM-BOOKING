'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { Star, Check, X, Trash2 } from 'lucide-react';

interface AdminReview {
  id: string; rating: number; comment?: string; approved: boolean; createdAt: string;
  user: { name: string; email: string };
  package: { name: string };
}

export default function AdminReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<'ALL'|'PENDING'|'APPROVED'>('PENDING');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') api.get('/api/admin/reviews').then(r => setReviews(r.data.data));
  }, [user, authLoading]);

  const moderate = async (id: string, approved: boolean) => {
    await api.patch(`/api/admin/reviews/${id}`, { approved });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved } : r));
    toast.success(approved ? 'Review approved' : 'Review rejected');
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/api/admin/reviews/${id}`);
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success('Deleted');
  };

  const filtered = reviews.filter(r => filter === 'ALL' ? true : filter === 'PENDING' ? !r.approved : r.approved);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Review Moderation</h2>
          <div className="flex gap-2">
            {(['PENDING','APPROVED','ALL'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {f} {f === 'PENDING' ? `(${reviews.filter(r => !r.approved).length})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-400">No reviews to show.</div>
          ) : filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{r.user.name}</span>
                    <span className="text-gray-400 text-xs">on {r.package.name}</span>
                  </div>
                  {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                  <p className="text-gray-400 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!r.approved && (
                    <button onClick={() => moderate(r.id, true)} className="bg-green-50 text-green-600 hover:bg-green-100 p-1.5 rounded-lg" title="Approve">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {r.approved && (
                    <button onClick={() => moderate(r.id, false)} className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 p-1.5 rounded-lg" title="Reject">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteReview(r.id)} className="bg-red-50 text-red-400 hover:bg-red-100 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {r.approved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
