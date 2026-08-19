'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { 
  Sparkles, Users, Mail, Send, Trash2, Tag, Calendar, 
  Copy, Check, Megaphone, ShieldCheck, Search, BellRing, 
  CheckCircle2, XCircle, Clock, DollarSign, Plane, AlertTriangle, 
  ChevronRight, Phone, RefreshCw, UserCheck, ShieldAlert
} from 'lucide-react';

interface EnrichedSubscriber {
  id: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  active: boolean;
  createdAt: string;
  reviewedAt?: string | null;
  isRegistered: boolean;
  userName: string;
  userPhone: string | null;
  totalBookings: number;
  confirmedBookings: number;
  totalSpent: number;
  latestBooking?: {
    destination: string;
    packageName: string;
    travelDate: string;
    status: string;
    amount: number;
  } | null;
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

  const [subscribers, setSubscribers] = useState<EnrichedSubscriber[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'broadcast'>('pending');
  const [copiedAll, setCopiedAll] = useState(false);

  // Broadcaster Form
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

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    try {
      const res = await api.patch(`/api/admin/vip/${id}`, { status });
      toast.success(res.data.message || `VIP status updated to ${status}`);
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status, reviewedAt: new Date().toISOString() } : s))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update VIP status');
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
      await api.post('/api/admin/vip', form);
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

  const handleDeleteApplicant = async (id: string) => {
    if (!confirm('Are you sure you want to remove this applicant?')) return;
    try {
      await api.delete(`/api/admin/vip/${id}?type=subscriber`);
      toast.success('Applicant record removed');
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error('Failed to remove record');
    }
  };

  const pendingList = subscribers.filter((s) => s.status === 'PENDING');
  const approvedList = subscribers.filter((s) => s.status === 'APPROVED');
  const rejectedList = subscribers.filter((s) => s.status === 'REJECTED');
  const totalApprovedSpend = approvedList.reduce((sum, s) => sum + s.totalSpent, 0);

  const getFilteredList = () => {
    let list = activeTab === 'pending' ? pendingList : activeTab === 'approved' ? approvedList : rejectedList;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.email.toLowerCase().includes(q) ||
          s.userName.toLowerCase().includes(q) ||
          (s.userPhone && s.userPhone.includes(q))
      );
    }
    return list;
  };

  const handleCopyApprovedEmails = () => {
    if (approvedList.length === 0) {
      toast.error('No approved VIP members to copy');
      return;
    }
    const emails = approvedList.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedAll(true);
    toast.success(`Copied ${approvedList.length} approved VIP email addresses!`);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold mb-3 border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>VIP Customer Approval & Spend Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              VIP Club & Travel Approvals
            </h1>
            <p className="text-orange-100 text-sm max-w-xl mt-1.5 leading-relaxed">
              Review traveler booking history, spending, and confirmed trips before approving VIP membership. Broadcast secret discounts exclusively to verified VIP travelers.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-center">
              <div className="text-2xl font-black text-amber-300">{pendingList.length}</div>
              <div className="text-[11px] text-orange-200 font-bold uppercase mt-0.5">Pending Review</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-center">
              <div className="text-2xl font-black text-emerald-300">{approvedList.length}</div>
              <div className="text-[11px] text-orange-200 font-bold uppercase mt-0.5">Approved VIPs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-center">
              <div className="text-2xl font-black text-white">₹{totalApprovedSpend.toLocaleString()}</div>
              <div className="text-[11px] text-orange-200 font-bold uppercase mt-0.5">VIP Spending</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pending Review</span>
              {pendingList.length > 0 && (
                <span className="bg-white text-amber-600 px-2 py-0.5 rounded-full text-xs font-black">
                  {pendingList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'approved'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Approved VIPs</span>
              <span className="opacity-80 text-xs">({approvedList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'rejected'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Declined ({rejectedList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'broadcast'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Deals ({announcements.length})</span>
            </button>
          </div>

          {activeTab !== 'broadcast' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {activeTab === 'approved' && (
                <button
                  onClick={handleCopyApprovedEmails}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Copied!' : 'Copy VIP Emails'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab 1: Pending Applications View with Full Travel Intelligence */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                  <span>Pending VIP Applications</span>
                  <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {pendingList.length} Awaiting Approval
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Inspect the applicant&apos;s registered bookings and revenue before deciding to accept or decline.
                </p>
              </div>

              <button
                onClick={fetchData}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh List
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-white dark:bg-gray-800 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : getFilteredList().length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 text-gray-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-gray-800 dark:text-white text-base">All Caught Up!</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  There are no pending VIP applications to review right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFilteredList().map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-amber-200/80 dark:border-amber-900/50 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white text-base">
                              {sub.userName}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                sub.isRegistered
                                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {sub.isRegistered ? 'Registered User' : 'Guest'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-orange-500" /> {sub.email}
                            </span>
                            {sub.userPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-500" /> {sub.userPhone}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      </div>

                      {/* Travel Intelligence Metrics */}
                      <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-700/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-center mb-3">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase">Trips Booked</div>
                          <div className="text-sm font-black text-gray-800 dark:text-white mt-0.5">
                            {sub.totalBookings}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase">Confirmed</div>
                          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {sub.confirmedBookings}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase">Total Spend</div>
                          <div className="text-sm font-black text-orange-600 dark:text-amber-400 mt-0.5">
                            ₹{sub.totalSpent.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Latest Booking Snippet */}
                      {sub.latestBooking ? (
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-4 bg-orange-50/50 dark:bg-orange-950/20 p-2.5 rounded-xl border border-orange-100 dark:border-orange-900/40 flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1">
                            <Plane className="w-3.5 h-3.5 text-orange-500" /> Latest: {sub.latestBooking.destination}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{sub.latestBooking.amount.toLocaleString()} ({sub.latestBooking.status})
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-gray-400" /> No past bookings found for this email.
                        </div>
                      )}
                    </div>

                    {/* Decision Actions */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700/80 flex items-center gap-2.5">
                      <button
                        onClick={() => handleUpdateStatus(sub.id, 'APPROVED')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept & Approve as VIP</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(sub.id, 'REJECTED')}
                        className="bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition border border-red-200 dark:border-red-800 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2 & 3: Approved VIPs & Rejected Applicants Table */}
        {(activeTab === 'approved' || activeTab === 'rejected') && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {activeTab === 'approved' ? 'Verified VIP Members' : 'Declined VIP Requests'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeTab === 'approved'
                    ? `${approvedList.length} members with confirmed VIP status`
                    : `${rejectedList.length} applications declined`}
                </p>
              </div>
            </div>

            {getFilteredList().length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">No records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <th className="pb-3 px-4">Traveler</th>
                      <th className="pb-3 px-4">Email</th>
                      <th className="pb-3 px-4 text-center">Confirmed Trips</th>
                      <th className="pb-3 px-4 text-center">Lifetime Spend</th>
                      <th className="pb-3 px-4">Decision Date</th>
                      <th className="pb-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                    {getFilteredList().map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            {sub.status === 'APPROVED' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                            <span>{sub.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs font-mono">
                          {sub.email}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-md">
                            {sub.confirmedBookings} trips
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-orange-600 dark:text-amber-400">
                          ₹{sub.totalSpent.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {sub.reviewedAt
                            ? new Date(sub.reviewedAt).toLocaleDateString()
                            : new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {sub.status === 'APPROVED' ? (
                              <button
                                onClick={() => handleUpdateStatus(sub.id, 'REJECTED')}
                                className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                                title="Revoke VIP Status"
                              >
                                Revoke VIP
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(sub.id, 'APPROVED')}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                                title="Approve VIP Status"
                              >
                                Approve VIP
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteApplicant(sub.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Broadcast Deals & Announcements Tool */}
        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                    placeholder="Exclusive deal for verified VIP members. Valid on bookings made this weekend with complimentary houseboat stay."
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

            {/* Active Announcements */}
            <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">Active Announcements</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{announcements.length} broadcasts active</p>
                </div>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">No VIP announcements posted yet</p>
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
                        className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
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
        )}
      </div>
    </AdminLayout>
  );
}
