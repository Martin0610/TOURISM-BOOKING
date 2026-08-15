'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Package } from '@/lib/types';
import Link from 'next/link';
import { MapPin, Clock, Users, Search, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Beach', 'Hill Station', 'Adventure', 'Wildlife', 'Heritage', 'Spiritual', 'Nature', 'Luxury', 'Family', 'Cultural', 'Island', 'Pilgrimage'];

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (state) params.append('state', state);
      if (category && category !== 'All') params.append('category', category);
      if (maxPrice) params.append('maxPrice', maxPrice);
      const res = await api.get(`/api/packages?${params.toString()}`);
      setPackages(res.data.data);
    } catch {
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const transportIcon = (included: boolean) => included ? '✈️ Transport incl.' : '🚗 Self transport';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">Tourism Packages</h1>
          <p className="text-blue-100">10 handpicked destinations across India</p>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchPackages()}
                  placeholder="Destination, activity..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">State</label>
              <input value={state} onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Kerala"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map((c) => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Price (₹)</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={fetchPackages}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" /> Apply
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />)}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl mb-2">No packages found.</p>
              <button onClick={() => { setSearch(''); setState(''); setCategory(''); setMaxPrice(''); fetchPackages(); }}
                className="text-blue-600 hover:underline text-sm">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Link key={pkg.id} href={`/packages/${pkg.id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 relative overflow-hidden">
                    {pkg.imageUrl ? (
                      <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🌍</div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {pkg.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {pkg.availableSeats} seats left
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1 line-clamp-1">{pkg.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>{pkg.destination}, {pkg.state}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">{pkg.shortDescription}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pkg.durationDays}D/{pkg.durationNights}N</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{pkg.availableSeats} seats</span>
                      <span>{pkg.hotelCategory}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{transportIcon(pkg.transportIncluded)}</span>
                      <div className="text-right">
                        <span className="text-blue-600 font-bold text-xl">₹{pkg.pricePerPerson.toLocaleString()}</span>
                        <span className="text-gray-400 text-xs block">per person</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
