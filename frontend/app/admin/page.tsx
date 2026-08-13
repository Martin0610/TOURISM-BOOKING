'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Package, Users, ShoppingBag, DollarSign } from 'lucide-react';

interface Stats {
  totalPackages: number;
  totalUsers: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    if (user?.role === 'ADMIN') {
      api.get('/api/admin/stats').then((res) => setStats(res.data.data));
    }
  }, [user, authLoading]);

  if (!stats) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  );

  const cards = [
    { label: 'Total Packages', value: stats.totalPackages, icon: Package, color: 'bg-blue-500', href: '/admin/packages' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-green-500', href: '/admin/users' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: ShoppingBag, color: 'bg-yellow-500', href: '/admin/bookings' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500', href: '/admin/payments' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Sidebar-style Header */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">TourEase Admin</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/admin/packages" className="hover:text-purple-300 transition">Packages</Link>
          <Link href="/admin/bookings" className="hover:text-purple-300 transition">Bookings</Link>
          <Link href="/admin/users" className="hover:text-purple-300 transition">Users</Link>
          <Link href="/admin/payments" className="hover:text-purple-300 transition">Payments</Link>
          <Link href="/" className="text-gray-400 hover:text-white transition">← Site</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Dashboard Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
              <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-500 text-sm">{label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            </Link>
          ))}
        </div>

        {/* Booking breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Booking Breakdown</h3>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.confirmedBookings}</p>
              <p className="text-sm text-gray-500 mt-1">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">{stats.pendingBookings}</p>
              <p className="text-sm text-gray-500 mt-1">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
              <p className="text-sm text-gray-500 mt-1">Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
