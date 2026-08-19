'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Package } from '@/lib/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

const CATEGORIES = ['Beach','Hill Station','Adventure','Wildlife','Heritage','Spiritual','Nature','Luxury','Family','Cultural','Island','Pilgrimage'];
const HOTEL_CATEGORIES = ['3 Star','4 Star','5 Star','Premium Resort','Houseboat','Boutique Hotel','Homestay'];

const emptyForm = {
  name: '', destination: '', state: '', shortDescription: '', description: '',
  pricePerPerson: '', durationDays: '', durationNights: '', category: 'Beach',
  availableSeats: '', hotelCategory: '3 Star', accommodation: '', mealsIncluded: '',
  transportIncluded: false, sightseeingIncluded: true, bestTimeToVisit: '',
  itinerary: '', inclusions: '', exclusions: '', cancellationPolicy: '', imageUrl: '',
};

type FormState = typeof emptyForm;

import AdminLayout from '@/components/AdminLayout';

export default function AdminPackagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'policy'>('basic');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (user?.role === 'ADMIN') fetchPackages();
  }, [user, authLoading]);

  const fetchPackages = async () => {
    const res = await api.get('/api/packages');
    setPackages(res.data.data);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setActiveTab('basic');
    setShowForm(true);
  };

  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    setForm({
      name: pkg.name, destination: pkg.destination, state: pkg.state,
      shortDescription: pkg.shortDescription, description: pkg.description,
      pricePerPerson: String(pkg.pricePerPerson), durationDays: String(pkg.durationDays),
      durationNights: String(pkg.durationNights), category: pkg.category,
      availableSeats: String(pkg.availableSeats), hotelCategory: pkg.hotelCategory,
      accommodation: pkg.accommodation, mealsIncluded: pkg.mealsIncluded,
      transportIncluded: pkg.transportIncluded, sightseeingIncluded: pkg.sightseeingIncluded,
      bestTimeToVisit: pkg.bestTimeToVisit, itinerary: pkg.itinerary,
      inclusions: pkg.inclusions, exclusions: pkg.exclusions,
      cancellationPolicy: pkg.cancellationPolicy, imageUrl: pkg.imageUrl || '',
    });
    setActiveTab('basic');
    setShowForm(true);
  };

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerPerson: parseFloat(form.pricePerPerson),
        durationDays: parseInt(form.durationDays),
        durationNights: parseInt(form.durationNights),
        availableSeats: parseInt(form.availableSeats),
      };
      if (editing) {
        await api.put(`/api/packages/${editing.id}`, payload);
        toast.success('Package updated');
      } else {
        await api.post('/api/packages', payload);
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

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/api/packages/${confirmDelete.id}`);
      toast.success('Package deleted');
      setConfirmDelete(null);
      fetchPackages();
    } catch { toast.error('Delete failed'); }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <AdminLayout>
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Package"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Packages ({packages.length})</h2>
          <button onClick={openCreate}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition text-sm font-bold shadow-md shadow-purple-600/25 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? 'Edit Package' : 'Add New Package'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
                {(['basic', 'details', 'policy'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition capitalize cursor-pointer ${activeTab === tab ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    {tab === 'basic' ? 'Basic Info' : tab === 'details' ? 'Itinerary & Details' : 'Policy & Image'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-6 py-4">
                {/* Tab: Basic Info */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Package Name *</label>
                        <input className={inputCls} required value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
                      <div><label className={labelCls}>Destination *</label>
                        <input className={inputCls} required value={form.destination} onChange={(e) => set('destination', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>State *</label>
                        <input className={inputCls} required value={form.state} onChange={(e) => set('state', e.target.value)} /></div>
                      <div><label className={labelCls}>Category *</label>
                        <select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)}>
                          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className={labelCls}>Price/Person (₹) *</label>
                        <input type="number" className={inputCls} required value={form.pricePerPerson} onChange={(e) => set('pricePerPerson', e.target.value)} /></div>
                      <div><label className={labelCls}>Duration Days *</label>
                        <input type="number" className={inputCls} required min={1} value={form.durationDays} onChange={(e) => set('durationDays', e.target.value)} /></div>
                      <div><label className={labelCls}>Duration Nights *</label>
                        <input type="number" className={inputCls} required min={0} value={form.durationNights} onChange={(e) => set('durationNights', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Available Seats *</label>
                        <input type="number" className={inputCls} required min={1} value={form.availableSeats} onChange={(e) => set('availableSeats', e.target.value)} /></div>
                      <div><label className={labelCls}>Hotel Category *</label>
                        <select className={inputCls} value={form.hotelCategory} onChange={(e) => set('hotelCategory', e.target.value)}>
                          {HOTEL_CATEGORIES.map((h) => <option key={h}>{h}</option>)}
                        </select></div>
                    </div>
                    <div><label className={labelCls}>Short Description (1 sentence) *</label>
                      <input className={inputCls} required value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} /></div>
                    <div><label className={labelCls}>Full Description *</label>
                      <textarea rows={3} className={inputCls} required value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
                  </div>
                )}

                {/* Tab: Details & Itinerary */}
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Accommodation Details *</label>
                        <input className={inputCls} required placeholder="e.g. 4 Star luxury resort with pool" value={form.accommodation} onChange={(e) => set('accommodation', e.target.value)} /></div>
                      <div><label className={labelCls}>Meals Included *</label>
                        <input className={inputCls} required placeholder="e.g. Daily breakfast & dinner" value={form.mealsIncluded} onChange={(e) => set('mealsIncluded', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Best Time to Visit *</label>
                        <input className={inputCls} required placeholder="e.g. October to March" value={form.bestTimeToVisit} onChange={(e) => set('bestTimeToVisit', e.target.value)} /></div>
                      <div className="flex items-center gap-6 pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" checked={form.sightseeingIncluded} onChange={(e) => set('sightseeingIncluded', e.target.checked)} className="rounded text-purple-600" />
                          <span>Sightseeing Included</span>
                        </label>
                      </div>
                    </div>
                    <div><label className={labelCls}>Daily Itinerary *</label>
                      <textarea rows={6} className={inputCls} required placeholder="Day 1: ...&#10;Day 2: ..." value={form.itinerary} onChange={(e) => set('itinerary', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Inclusions (one per line) *</label>
                        <textarea rows={4} className={inputCls} required placeholder="Hotel stay&#10;Breakfast&#10;Transfers" value={form.inclusions} onChange={(e) => set('inclusions', e.target.value)} /></div>
                      <div><label className={labelCls}>Exclusions (one per line) *</label>
                        <textarea rows={4} className={inputCls} required placeholder="Flight tickets&#10;Personal expenses" value={form.exclusions} onChange={(e) => set('exclusions', e.target.value)} /></div>
                    </div>
                  </div>
                )}

                {/* Tab: Policy & Image */}
                {activeTab === 'policy' && (
                  <div className="space-y-4">
                    <div><label className={labelCls}>Cancellation Policy *</label>
                      <textarea rows={4} className={inputCls} required value={form.cancellationPolicy} onChange={(e) => set('cancellationPolicy', e.target.value)} /></div>
                    <div><label className={labelCls}>Image URL</label>
                      <input type="url" className={inputCls} placeholder="https://images.unsplash.com/..." value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} />
                      {form.imageUrl && (
                        <img src={form.imageUrl} alt="preview" className="mt-2 h-32 w-full object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  {activeTab !== 'basic' && (
                    <button type="button" onClick={() => setActiveTab(activeTab === 'policy' ? 'details' : 'basic')}
                      className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer">
                      ← Back
                    </button>
                  )}
                  {activeTab !== 'policy' ? (
                    <button type="button" onClick={() => setActiveTab(activeTab === 'basic' ? 'details' : 'policy')}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl font-bold transition text-sm cursor-pointer shadow-md shadow-purple-600/20">
                      Next →
                    </button>
                  ) : (
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-xl font-bold disabled:opacity-60 transition text-sm cursor-pointer shadow-md">
                      {saving ? 'Saving...' : editing ? 'Update Package' : 'Create Package'}
                    </button>
                  )}
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Packages Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {['Package', 'Destination', 'Category', 'Price/Person', 'Duration', 'Seats', 'Hotel', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 dark:text-white max-w-48 truncate">{pkg.name}</div>
                      <div className="text-xs text-gray-400">{pkg.durationDays}D/{pkg.durationNights}N</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700 dark:text-gray-300">{pkg.destination}</div>
                      <div className="text-xs text-gray-400">{pkg.state}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 text-xs px-2.5 py-0.5 rounded-full font-semibold">{pkg.category}</span>
                    </td>
                    <td className="px-4 py-3 text-purple-600 dark:text-purple-400 font-bold">₹{pkg.pricePerPerson.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{pkg.durationDays}D</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${pkg.availableSeats < 5 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {pkg.availableSeats}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{pkg.hotelCategory}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(pkg)}
                          className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition cursor-pointer" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete({ id: pkg.id, name: pkg.name })}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {packages.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="mb-3">No packages yet.</p>
                <button onClick={openCreate} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Add your first package</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
