'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import {
  Package, Users, ShoppingBag, DollarSign,
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

const COLORS = ['#2563eb', '#f59e0b', '#ef4444', '#10b981'];

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

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') {
      api.get('/api/admin/stats')
        .then((res) => setStats(res.data.data))
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

  if (!stats) return null;

  const bookingStatusData = [
    { name: 'Confirmed', value: stats.confirmedBookings },
    { name: 'Pending', value: stats.pendingBookings },
    { name: 'Cancelled', value: stats.cancelledBookings },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total Packages', value: stats.totalPackages, icon: Package, color: 'bg-blue-500', change: 'Active listings' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-emerald-500', change: 'Registered' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: ShoppingBag, color: 'bg-violet-500', change: `${stats.confirmedBookings} confirmed` },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'bg-orange-500', change: 'From payments' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`${color} w-11 h-11 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{change}</p>
            </div>
          ))}
        </div>

        {/* Booking Status Mini Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Confirmed', value: stats.confirmedBookings, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Cancelled', value: stats.cancelledBookings, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
              <Icon className={`w-8 h-8 ${color}`} />
              <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className={`text-sm font-medium ${color}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Monthly Revenue</h3>
            {stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [`₹${(v as number).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No revenue data yet. Complete a payment to see charts.
              </div>
            )}
          </div>

          {/* Booking Status Pie */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Booking Status</h3>
            {bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
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
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No bookings yet.</div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Recent Bookings</h3>
              <a href="/admin/bookings" className="text-blue-600 text-sm hover:underline">View all →</a>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.recentBookings.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">No bookings yet.</p>
              ) : (
                stats.recentBookings.map((booking) => (
                  <div key={booking.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{booking.package?.name}</p>
                      <p className="text-xs text-gray-400">{booking.user?.name} · {booking.numberOfPeople} people</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-semibold text-gray-800">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Packages */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Top Packages</h3>
              <a href="/admin/packages" className="text-blue-600 text-sm hover:underline">View all →</a>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.topPackages.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">No bookings yet.</p>
              ) : (
                stats.topPackages.map((tp, i) => (
                  <div key={tp.packageId} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{tp.package?.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{tp.package?.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{tp._count.packageId} bookings</p>
                      <p className="text-xs text-gray-400">₹{(tp._sum.totalAmount ?? 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
