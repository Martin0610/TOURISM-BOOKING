'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Booking } from '@/lib/types';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AdminBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') {
      api.get('/api/bookings')
        .then((res) => {
          console.log('Bookings data:', res.data);
          setBookings(res.data.data);
        })
        .catch((err) => {
          console.error('Failed to fetch bookings:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/bookings/${id}`, { status });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: status as Booking['status'] } : b));
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Bookings</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-16 animate-pulse" />)}</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['User', 'Package', 'Travel Date', 'People', 'Amount', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{b.user?.name}</td>
                    <td className="px-4 py-3 text-gray-700">{b.package?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(b.travelDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">{b.numberOfPeople}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium">₹{b.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatus(b.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <p className="text-center py-10 text-gray-400">No bookings yet.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
