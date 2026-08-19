'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { Search, Shield, User, Mail, Phone, Calendar } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  bookings: { id: string; status: string; totalAmount: number }[];
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') {
      api.get('/api/admin/users').then(res => {
        setUsers(res.data.data);
        setFiltered(res.data.data);
      }).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!search) { setFiltered(users); return; }
    setFiltered(users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, users]);

  const handleRoleToggle = async (u: AdminUser) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
    try {
      await api.patch(`/api/admin/users/${u.id}/role`, { role: newRole });
      toast.success('Role updated');
      const updated = { ...u, role: newRole };
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
      if (selected?.id === u.id) setSelected(updated);
    } catch { toast.error('Failed to update role'); }
  };

  const getUserRevenue = (u: AdminUser) =>
    u.bookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length },
            { label: 'With Bookings', value: users.filter(u => u.bookings.length > 0).length },
            { label: 'Total Bookings', value: users.reduce((s, u) => s + u.bookings.length, 0) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* User Grid */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-gray-400">No users found.</div>
            ) : (
              filtered.map(u => (
                <div key={u.id} onClick={() => setSelected(u)}
                  className={`bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${selected?.id === u.id ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/30' : 'border-gray-100 dark:border-gray-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 dark:text-white">{u.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{u.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{u.bookings.length} bookings</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">₹{getUserRevenue(u).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            {selected ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 shadow-md shadow-purple-500/25">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">{selected.name}</h3>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${selected.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {selected.role}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {[
                    { icon: Mail, label: selected.email },
                    { icon: Phone, label: selected.phone || 'No phone' },
                    { icon: Calendar, label: `Joined ${new Date(selected.createdAt).toLocaleDateString('en-IN')}` },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-gray-500">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Bookings', value: selected.bookings.length },
                    { label: 'Confirmed', value: selected.bookings.filter(b => b.status === 'CONFIRMED').length },
                    { label: 'Pending', value: selected.bookings.filter(b => b.status === 'PENDING').length },
                    { label: 'Revenue', value: `₹${getUserRevenue(selected).toLocaleString('en-IN')}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="font-bold text-gray-800">{value}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleRoleToggle(selected)}
                  className={`w-full py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${selected.role === 'ADMIN' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                  {selected.role === 'ADMIN' ? <><User className="w-4 h-4" /> Remove Admin</> : <><Shield className="w-4 h-4" /> Make Admin</>}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-16">
                <User className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Select a user to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
