'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { Search, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

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
  SUCCESS: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  FAILED: { color: 'bg-red-100 text-red-700', icon: XCircle },
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
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-blue-600', icon: DollarSign },
            { label: 'Successful', value: successCount, color: 'text-green-600', icon: CheckCircle },
            { label: 'Pending', value: pendingCount, color: 'text-yellow-600', icon: Clock },
            { label: 'Total Transactions', value: payments.length, color: 'text-gray-800', icon: DollarSign },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <Icon className={`w-8 h-8 ${color} opacity-70`} />
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by user, order ID, payment ID..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-2">
            {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${statusFilter === s ? 'bg-purple-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Payments Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      {['User', 'Package', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const cfg = statusConfig[p.status] || statusConfig.PENDING;
                      const Icon = cfg.icon;
                      return (
                        <tr key={p.id} onClick={() => setSelected(p)}
                          className={`border-b border-gray-100 dark:border-gray-800 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 cursor-pointer ${selected?.id === p.id ? 'bg-purple-50 dark:bg-purple-950/40' : ''}`}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800 dark:text-white">{p.booking?.user?.name}</p>
                            <p className="text-xs text-gray-400">{p.booking?.user?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-32 truncate">{p.booking?.package?.name}</td>
                          <td className="px-4 py-3 text-purple-600 dark:text-purple-400 font-bold">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${cfg.color}`}>
                              <Icon className="w-3 h-3" />{p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {!loading && filtered.length === 0 && <p className="text-center py-10 text-gray-400">No payments found.</p>}
            </div>
          </div>

          {/* Detail */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {selected ? (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">Payment Detail</h3>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${statusConfig[selected.status]?.color}`}>
                  {(() => { const Icon = statusConfig[selected.status]?.icon; return <Icon className="w-4 h-4" />; })()}
                  {selected.status}
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Amount', value: `₹${selected.amount.toLocaleString('en-IN')}` },
                    { label: 'User', value: selected.booking?.user?.name },
                    { label: 'Package', value: selected.booking?.package?.name },
                    { label: 'Travel Date', value: new Date(selected.booking?.travelDate).toLocaleDateString('en-IN') },
                    { label: 'Date', value: new Date(selected.createdAt).toLocaleDateString('en-IN') },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-gray-400 flex-shrink-0">{label}</span>
                      <span className="text-gray-800 font-medium text-right truncate">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Razorpay IDs</p>
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="text-xs font-mono text-gray-700 break-all">{selected.razorpayOrderId}</p>
                  </div>
                  {selected.razorpayPaymentId && (
                    <div>
                      <p className="text-xs text-gray-400">Payment ID</p>
                      <p className="text-xs font-mono text-gray-700 break-all">{selected.razorpayPaymentId}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-16">
                <DollarSign className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Select a payment to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
