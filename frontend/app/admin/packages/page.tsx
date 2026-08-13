'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Package } from '@/lib/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { name: '', destination: '', description: '', price: '', duration: '', availableSeats: '', imageUrl: '', itinerary: '' };

export default function AdminPackagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') fetchPackages();
  }, [user, authLoading]);

  const fetchPackages = async () => {
    const res = await api.get('/api/packages');
    setPackages(res.data.data);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    setForm({ name: pkg.name, destination: pkg.destination, description: pkg.description || '', price: String(pkg.price), duration: String(pkg.duration), availableSeats: String(pkg.availableSeats), imageUrl: pkg.imageUrl || '', itinerary: pkg.itinerary || '' });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/packages/${editing.id}`, form);
        toast.success('Package updated');
      } else {
        await api.post('/api/packages', form);
        toast.success('Package created');
      }
      setShowForm(false);
      fetchPackages();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    try {
      await api.delete(`/api/packages/${id}`);
      toast.success('Package deleted');
      fetchPackages();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">TourEase Admin</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/admin" className="hover:text-purple-300">Dashboard</Link>
          <Link href="/admin/bookings" className="hover:text-purple-300">Bookings</Link>
          <Link href="/admin/users" className="hover:text-purple-300">Users</Link>
          <Link href="/admin/payments" className="hover:text-purple-300">Payments</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Packages</h2>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition text-sm">
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Package' : 'Add Package'}</h3>
              <form onSubmit={handleSave} className="space-y-3">
                {[
                  { key: 'name', label: 'Package Name', type: 'text' },
                  { key: 'destination', label: 'Destination', type: 'text' },
                  { key: 'price', label: 'Price (₹)', type: 'number' },
                  { key: 'duration', label: 'Duration (days)', type: 'number' },
                  { key: 'availableSeats', label: 'Available Seats', type: 'number' },
                  { key: 'imageUrl', label: 'Image URL (optional)', type: 'url' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      required={!['imageUrl'].includes(key)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itinerary</label>
                  <textarea rows={4} value={form.itinerary} onChange={(e) => setForm({ ...form, itinerary: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 transition">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Name', 'Destination', 'Price', 'Duration', 'Seats', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{pkg.name}</td>
                  <td className="px-4 py-3 text-gray-500">{pkg.destination}</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">₹{pkg.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{pkg.duration}d</td>
                  <td className="px-4 py-3 text-gray-500">{pkg.availableSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(pkg)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(pkg.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {packages.length === 0 && <p className="text-center py-10 text-gray-400">No packages yet.</p>}
        </div>
      </div>
    </div>
  );
}
