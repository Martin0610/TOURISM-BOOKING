'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import {
  Package, Users, ShoppingBag, IndianRupee,
  TrendingUp, CheckCircle, Clock, XCircle, MapPin
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

interface Stats {
  totalPackages: number;
  totalUsers: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  recentBookings: {
    id: string;
    status: string;
    totalAmount: number;
    travelDate: string;
    numberOfPeople: number;
    createdAt: string;
    user: { name: string; email: string };
    package: { name: string; destination: string };
  }[];
  topPackages: {
    packageId: string;
    _count: { packageId: number };
    _sum: { totalAmount: number | null };
    package?: { name: string; destination: string; imageUrl?: string };
  }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

const COLORS = ['#9333ea', '#f59e0b', '#ef4444', '#10b981'];

const statusColor: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') {
      api.get('/api/admin/stats')
        .then((res) => setStats(res.data.data))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    </AdminLayout>
  );

  if (!stats) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-slate-500">{error ? 'Failed to load dashboard stats. Please refresh.' : 'No data available.'}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition cursor-pointer">
          Refresh
        </button>
      </div>
    </AdminLayout>
  );

  const bookingStatusData = [
    { name: 'Confirmed', value: stats.confirmedBookings },
    { name: 'Pending', value: stats.pendingBookings },
    { name: 'Cancelled', value: stats.cancelledBookings },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total Packages', value: stats.totalPackages, icon: Package, color: 'bg-blue-600', change: 'Active listings' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-emerald-600', change: 'Registered' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: ShoppingBag, color: 'bg-slate-800', change: `${stats.confirmedBookings} confirmed` },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-amber-600', change: 'From payments' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`${color} w-11 h-11 rounded-xl flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{change}</p>
            </div>
          ))}
        </div>

        {/* Booking Status Mini Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Confirmed', value: stats.confirmedBookings, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
            { label: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
            { label: 'Cancelled', value: stats.cancelledBookings, icon: XCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
              <Icon className={`w-8 h-8 ${color}`} />
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
                <p className={`text-sm font-medium ${color}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue Bar Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-base">Monthly Revenue</h3>
            {stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [`₹${(v as number).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#9333ea" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                No revenue data yet. Complete a payment to see charts.
              </div>
            )}
          </div>

          {/* Booking Status Pie */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-base">Booking Status</h3>
            {bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    paddingAngle={4} dataKey="value">
                    {bookingStatusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No bookings yet.</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
