'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Trash2, Edit } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Coupon {
  id: string; code: string; discountType: string; discountValue: number;
  minBookingAmount: number; maxUses: number; usedCount: number;
  expiresAt: string; active: boolean;
}

const empty = { code: '', discountType: 'PERCENTAGE', discountValue: '', minBookingAmount: '', maxUses: '100', expiresAt: '' };

export default function AdminCouponsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') api.get('/api/admin/coupons').then(r => setCoupons(r.data.data));
  }, [user, authLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minBookingAmount: parseFloat(form.minBookingAmount || '0'),
        maxUses: parseInt(form.maxUses),
        expiresAt: new Date(form.expiresAt).toISOString(),
      };

      if (editing) {
        await api.put(`/api/admin/coupons/${editing}`, payload);
        setEditing(null);
      } else {
        await api.post('/api/admin/coupons', payload);
      }
      setShowForm(false); setForm(empty);
      const r = await api.get('/api/admin/coupons'); setCoupons(r.data.data);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed';
      console.error('Save error:', err);
      alert(errorMsg);
    } finally { setSaving(false); }
  };

  const handleEdit = (c: Coupon) => {
    setEditing(c.id);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue.toString(),
      minBookingAmount: c.minBookingAmount.toString(),
      maxUses: c.maxUses.toString(),
      expiresAt: new Date(c.expiresAt).toISOString().slice(0, 16),
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(empty);
    setEditing(null);
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await api.put(`/api/admin/coupons/${c.id}`, { active: !c.active });
      setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !c.active } : x));
    } catch (err) {
      console.error('Toggle failed:', err);
      alert('Failed to update coupon status');
      // Refresh to get correct state from database
      const r = await api.get('/api/coupons');
      setCoupons(r.data.data);
    }
  };

  const deleteCoupon = async () => {
    if (!confirmDeleteId) return;
    await api.delete(`/api/admin/coupons/${confirmDeleteId}`);
    setCoupons(prev => prev.filter(c => c.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const inputCls = 'w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

  return (
    <AdminLayout>
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This cannot be undone."
        confirmLabel="Yes, Delete"
        onConfirm={deleteCoupon}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Coupon Management</h2>
          <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(empty); }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md shadow-purple-600/25 cursor-pointer">
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {editing ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
              <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="SAVE20" className={inputCls} disabled={!!editing} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className={inputCls}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
              <input required type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} placeholder={form.discountType === 'PERCENTAGE' ? '20' : '500'} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Booking Amount (₹)</label>
              <input type="number" value={form.minBookingAmount} onChange={e => setForm({...form, minBookingAmount: e.target.value})} placeholder="0" className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires At</label>
              <input required type="datetime-local" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className={inputCls} /></div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 cursor-pointer shadow-md">
                {saving ? 'Saving...' : editing ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button type="button" onClick={handleCancel} className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer font-medium">Cancel</button>
            </div>
          </form>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-gray-800">
              <tr>{['Code','Type','Value','Min Amount','Used/Max','Expires','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono font-bold text-purple-700 dark:text-purple-400">{c.code}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.discountType}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">₹{c.minBookingAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.usedCount}/{c.maxUses}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(c.expiresAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${c.active ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Interactive Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={c.active}
                        onClick={() => toggleActive(c)}
                        className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out cursor-pointer shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                          c.active ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={c.active ? 'Coupon is Active — Click to Disable' : 'Coupon is Inactive — Click to Enable'}
                      >
                        <span
                          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                            c.active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {/* Edit Button */}
                      <button onClick={() => handleEdit(c)} className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 p-1.5 rounded-lg cursor-pointer transition" title="Edit Coupon">
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button onClick={() => setConfirmDeleteId(c.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 p-1.5 rounded-lg cursor-pointer transition" title="Delete Coupon">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <p className="text-center py-10 text-gray-400">No coupons yet.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
