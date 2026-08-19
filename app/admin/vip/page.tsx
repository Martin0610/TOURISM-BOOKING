'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { 
  Sparkles, Users, Mail, Send, Trash2, Tag, Calendar, 
  Copy, Check, Megaphone, ShieldCheck, Search, BellRing, ArrowRight 
} from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  couponCode?: string | null;
  discount?: string | null;
  active: boolean;
  createdAt: string;
}

export default function AdminVipPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  // New Announcement Form State
  const [form, setForm] = useState({
    title: '',
    message: '',
    couponCode: '',
    discount: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/vip');
      if (res.data?.data) {
        setSubscribers(res.data.data.subscribers || []);
        setAnnouncements(res.data.data.announcements || []);
      }
    } catch {
      toast.error('Failed to load VIP data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/admin/vip', form);
      toast.success('VIP Announcement published successfully! 🚀');
      setForm({ title: '', message: '', couponCode: '', discount: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/api/admin/vip/${id}?type=announcement`);
      toast.success('Announcement deleted');
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    try {
      await api.delete(`/api/admin/vip/${id}?type=subscriber`);
      toast.success('Subscriber removed');
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error('Failed to remove subscriber');
    }
  };

  const handleCopyAllEmails = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to copy');
      return;
    }
    const emails = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedAll(true);
    toast.success(`Copied ${subscribers.length} VIP email addresses!`);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold mb-3 border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>VIP Secret Deals & Newsletter Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              VIP Club & Special Discounts
            </h1>
            <p className="text-orange-100 text-sm max-w-xl mt-1.5 leading-relaxed">
              Manage subscribed email members, broadcast secret promo deals, announce flash sales, and distribute exclusive coupon codes.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[120px]">
              <div className="text-3xl font-black text-white">{subscribers.length}</div>
              <div className="text-xs text-orange-200 font-semibold mt-0.5">VIP Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[120px]">
              <div className="text-3xl font-black text-amber-200">{announcements.length}</div>
              <div className="text-xs text-orange-200 font-semibold mt-0.5">Active Deals</div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Announce Deal vs Active Broadcasts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Announce Special Discount Form */}
          <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-gray-700">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Broadcast VIP Announcement</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Post a new secret discount or notification for members</p>
              </div>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 🔥 40% Secret Flash Sale on Kashmir Packages!"
                  className="w-full bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Message / Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Exclusive deal for VIP members. Valid on bookings made this weekend with complimentary houseboat stay."
                  className="w-full bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Special Coupon Code (optional)
                  </label>
                  <input
                    type="text"
                    value={form.couponCode}
                    onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. VIP40, SECRET2026"
                    className="w-full bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Discount Badge (optional)
                  </label>
                  <input
                    type="text"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder="e.g. 40% OFF, ₹5,000 OFF"
                    className="w-full bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              {form.title && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-2xl">
                  <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Live Member Preview
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{form.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{form.message}</p>
                  {(form.couponCode || form.discount) && (
                    <div className="mt-2.5 flex items-center gap-2">
                      {form.couponCode && (
                        <span className="bg-orange-600 text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg">
                          {form.couponCode}
                        </span>
                      )}
                      {form.discount && (
                        <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                          {form.discount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Broadcasting...' : 'Publish VIP Announcement'}</span>
              </button>
            </form>
          </div>

          {/* Active Broadcasts List */}
          <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-gray-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">Active Announcements</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{announcements.length} broadcasts published</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">No VIP announcements posted yet</p>
                  <p className="text-xs mt-1">Use the form to announce special discounts to your subscribers.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600 flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            ACTIVE
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{ann.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{ann.message}</p>

                        {(ann.couponCode || ann.discount) && (
                          <div className="mt-2 flex items-center gap-2">
                            {ann.couponCode && (
                              <span className="bg-orange-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                                {ann.couponCode}
                              </span>
                            )}
                            {ann.discount && (
                              <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                                {ann.discount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VIP Subscribers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">VIP Subscribers List</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {subscribers.length} total users signed up for VIP travel drops
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter emails..."
                  className="bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Copy All Emails */}
              <button
                onClick={handleCopyAllEmails}
                className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Copied!' : 'Copy All Emails'}</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Mail className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No subscribers found</p>
              <p className="text-xs mt-1">When visitors join via the VIP Deals footer box, their emails will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <th className="pb-3 px-4">#</th>
                    <th className="pb-3 px-4">Email Address</th>
                    <th className="pb-3 px-4">Subscribed Date</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {filteredSubscribers.map((sub, index) => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="py-3 px-4 text-xs font-semibold text-gray-400">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-orange-500" />
                        <span>{sub.email}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(sub.createdAt).toLocaleDateString()} at {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${sub.active ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-gray-100 text-gray-600'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {sub.active ? 'Active VIP' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          title="Remove subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
