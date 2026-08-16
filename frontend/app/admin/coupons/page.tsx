'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

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

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') api.get('/api/coupons').then(r => setCoupons(r.data.data));
  }, [user, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/api/coupons', form);
      toast.success('Coupon created');
      setShowForm(false); setForm(empty);
      const r = await api.get('/api/coupons'); setCoupons(r.data.data);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const toggleActive = async (c: Coupon) => {
    await api.put(`/api/coupons/${c.id}`, { active: !c.active });
    setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !c.active } : x));
    toast.success(c.active ? 'Coupon deactivated' : 'Coupon activated');
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await api.delete(`/api/coupons/${id}`);
    setCoupons(prev => prev.filter(c => c.id !== id));
    toast.success('Deleted');
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Coupon Management</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="SAVE20" className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className={inputCls}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input required type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} placeholder={form.discountType === 'PERCENTAGE' ? '20' : '500'} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Booking Amount (₹)</label>
              <input type="number" value={form.minBookingAmount} onChange={e => setForm({...form, minBookingAmount: e.target.value})} placeholder="0" className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input required type="datetime-local" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className={inputCls} /></div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">{saving ? 'Saving...' : 'Create Coupon'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Code','Type','Value','Min Amount','Used/Max','Expires','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">{c.code}</td>
                  <td className="px-4 py-3 text-gray-600">{c.discountType}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td className="px-4 py-3 text-gray-500">₹{c.minBookingAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-500">{c.usedCount}/{c.maxUses}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(c.expiresAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggleActive(c)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg" title={c.active ? 'Deactivate' : 'Activate'}>
                        {c.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteCoupon(c.id)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
