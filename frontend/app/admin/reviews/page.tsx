'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';

interface AdminReview {
  id: string; rating: number; comment?: string; approved: boolean; createdAt: string;
  user: { name: string; email: string };
  package: { name: string };
}

export default function AdminReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<'ALL'|'UNREAD'|'READ'>('UNREAD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') api.get('/api/admin/reviews').then(r => setReviews(r.data.data));
  }, [user, authLoading]);

  const toggleReadStatus = async (id: string, markAsRead: boolean) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/admin/reviews/${id}`, { approved: markAsRead });
      console.log('API Response:', response.data);
      
      // Update state immediately
      setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: markAsRead } : r));
      toast.success(markAsRead ? 'Marked as read' : 'Marked as unread');
    } catch (error: any) {
      console.error('Error updating review:', error);
      toast.error(error.response?.data?.message || 'Failed to update review status');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/api/admin/reviews/${id}`);
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success('Review deleted');
  };

  const filtered = reviews.filter(r => 
    filter === 'ALL' ? true : 
    filter === 'UNREAD' ? !r.approved : 
    r.approved
  );

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
          <div className="flex gap-2">
            {(['UNREAD','READ','ALL'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {f} {f === 'UNREAD' ? `(${reviews.filter(r => !r.approved).length})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-400">No reviews to show.</div>
          ) : filtered.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${!r.approved ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{r.user.name}</span>
                    <span className="text-gray-400 text-xs">• {r.user.email}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-1">Package: {r.package.name}</p>
                  {r.comment && <p className="text-gray-700 text-sm mt-2">{r.comment}</p>}
                  <p className="text-gray-400 text-xs mt-2">{new Date(r.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!r.approved ? (
                    <button 
                      onClick={() => toggleReadStatus(r.id, true)} 
                      disabled={loading}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors disabled:opacity-50" 
                      title="Mark as Read">
                      <Eye className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => toggleReadStatus(r.id, false)}
                      disabled={loading}
                      className="bg-gray-50 text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors disabled:opacity-50" 
                      title="Mark as Unread">
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteReview(r.id)} 
                    className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                    title="Delete Review">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${r.approved ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {r.approved ? '✓ Read' : '● Unread'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
