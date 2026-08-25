'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { Search, CheckCircle, Clock, XCircle, IndianRupee } from 'lucide-react';

interface AdminPayment {
  id: string;
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  status: string;
  createdAt: string;
  booking: {
    numberOfPeople: number;
    travelDate: string;
    user: { name: string; email: string };
    package: { name: string; destination: string };
  };
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  SUCCESS: { color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800', icon: CheckCircle },
  PENDING: { color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800', icon: Clock },
  FAILED: { color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800', icon: XCircle },
};

export default function AdminPaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [filtered, setFiltered] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<AdminPayment | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') {
      api.get('/api/admin/payments').then(res => {
        setPayments(res.data.data);
        setFiltered(res.data.data);
      }).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  useEffect(() => {
    let result = payments;
    if (statusFilter !== 'ALL') result = result.filter(p => p.status === statusFilter);
    if (search) result = result.filter(p =>
      p.booking?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.razorpayOrderId?.toLowerCase().includes(search.toLowerCase()) ||
      p.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, statusFilter, payments]);

  const totalRevenue = payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);
  const successCount = payments.filter(p => p.status === 'SUCCESS').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-slate-900 dark:text-white', icon: IndianRupee },
            { label: 'Successful', value: successCount, color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
            { label: 'Pending', value: pendingCount, color: 'text-amber-600 dark:text-amber-400', icon: Clock },
            { label: 'Total Transactions', value: payments.length, color: 'text-slate-900 dark:text-white', icon: IndianRupee },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Icon className={`w-7 h-7 ${color} opacity-80`} />
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by user, order ID, payment ID..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${statusFilter === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Payments Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> : (
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      {['User', 'Package', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const cfg = statusConfig[p.status] || statusConfig.PENDING;
                      const Icon = cfg.icon;
                      return (
                        <tr key={p.id} onClick={() => setSelected(p)}
                          className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer ${selected?.id === p.id ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900 dark:text-white">{p.booking?.user?.name}</p>
                            <p className="text-xs text-slate-400">{p.booking?.user?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-32 truncate">{p.booking?.package?.name}</td>
                          <td className="px-4 py-3 text-slate-900 dark:text-white font-bold">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold w-fit ${cfg.color}`}>
                              <Icon className="w-3 h-3" />{p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {!loading && filtered.length === 0 && <p className="text-center py-10 text-slate-400 text-xs">No payments found.</p>}
            </div>
          </div>

          {/* Detail */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            {selected ? (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Payment Detail</h3>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusConfig[selected.status]?.color}`}>
                  {(() => { const Icon = statusConfig[selected.status]?.icon; return <Icon className="w-3.5 h-3.5" />; })()}
                  {selected.status}
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    { label: 'Amount', value: `₹${selected.amount.toLocaleString('en-IN')}` },
                    { label: 'User', value: selected.booking?.user?.name },
                    { label: 'Package', value: selected.booking?.package?.name },
                    { label: 'Travel Date', value: new Date(selected.booking?.travelDate).toLocaleDateString('en-IN') },
                    { label: 'Date', value: new Date(selected.createdAt).toLocaleDateString('en-IN') },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-slate-400 flex-shrink-0">{label}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium text-right truncate">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Razorpay IDs</p>
                  <div>
                    <p className="text-[10px] text-slate-400">Order ID</p>
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{selected.razorpayOrderId}</p>
                  </div>
                  {selected.razorpayPaymentId && (
                    <div>
                      <p className="text-[10px] text-slate-400">Payment ID</p>
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{selected.razorpayPaymentId}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-16">
                <IndianRupee className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
                <p className="text-xs">Select a payment to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
