'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import ConfirmDialog from '@/components/ConfirmDialog';
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
  const [roleConfirm, setRoleConfirm] = useState<{
    open: boolean;
    user: AdminUser | null;
    newRole: string;
  }>({
    open: false,
    user: null,
    newRole: '',
  });

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

  const handleRoleToggle = (u: AdminUser) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setRoleConfirm({
      open: true,
      user: u,
      newRole,
    });
  };

  const handleConfirmRoleChange = async () => {
    const { user: targetUser, newRole } = roleConfirm;
    setRoleConfirm((prev) => ({ ...prev, open: false }));
    if (!targetUser) return;

    try {
      await api.patch(`/api/admin/users/${targetUser.id}/role`, { role: newRole });
      toast.success('Role updated');
      const updated = { ...targetUser, role: newRole };
      setUsers(prev => prev.map(x => x.id === targetUser.id ? updated : x));
      if (selected?.id === targetUser.id) setSelected(updated);
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
            <div key={label} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* User Grid */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center text-slate-400 border border-slate-200 dark:border-slate-800">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center text-slate-400 border border-slate-200 dark:border-slate-800">No users found.</div>
            ) : (
              filtered.map(u => (
                <div key={u.id} onClick={() => setSelected(u)}
                  className={`bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${selected?.id === u.id ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{u.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${u.role === 'ADMIN' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{u.bookings.length} bookings</p>
                      <p className="text-xs text-slate-900 dark:text-white font-bold">₹{getUserRevenue(u).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            {selected ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xl mx-auto mb-2.5">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{selected.name}</h3>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold mt-1 inline-block ${selected.role === 'ADMIN' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                    {selected.role}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { icon: Mail, label: selected.email },
                    { icon: Phone, label: selected.phone || 'No phone' },
                    { icon: Calendar, label: `Joined ${new Date(selected.createdAt).toLocaleDateString('en-IN')}` },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Icon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {[
                    { label: 'Total Bookings', value: selected.bookings.length },
                    { label: 'Confirmed', value: selected.bookings.filter(b => b.status === 'CONFIRMED').length },
                    { label: 'Pending', value: selected.bookings.filter(b => b.status === 'PENDING').length },
                    { label: 'Revenue', value: `₹${getUserRevenue(selected).toLocaleString('en-IN')}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 text-center border border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-slate-900 dark:text-white">{value}</p>
                      <p className="text-[11px] text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleRoleToggle(selected)}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${selected.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'}`}>
                  {selected.role === 'ADMIN' ? <><User className="w-3.5 h-3.5" /> Remove Admin</> : <><Shield className="w-3.5 h-3.5" /> Make Admin</>}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                <User className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-xs">Select a user to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={roleConfirm.open}
        title={roleConfirm.newRole === 'ADMIN' ? 'Grant Admin Privileges' : 'Revoke Admin Privileges'}
        message={`Are you sure you want to change ${roleConfirm.user?.name || 'this user'}'s role to ${roleConfirm.newRole}?`}
        confirmLabel={roleConfirm.newRole === 'ADMIN' ? 'Make Admin' : 'Revoke Admin'}
        variant={roleConfirm.newRole === 'ADMIN' ? 'primary' : 'warning'}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => setRoleConfirm((prev) => ({ ...prev, open: false }))}
      />
    </AdminLayout>
  );
}
