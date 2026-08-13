'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Package } from '@/lib/types';
import Link from 'next/link';
import { MapPin, Clock, Users, Search } from 'lucide-react';

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [destination, setDestination] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (destination) params.append('destination', destination);
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">Tourism Packages</h1>
          <p className="text-blue-100">Find your perfect getaway</p>
        </div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search packages..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Goa"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Price (₹)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchPackages}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* Package Grid */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl">No packages found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Link key={pkg.id} href={`/packages/${pkg.id}`} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 relative overflow-hidden">
                    {pkg.imageUrl ? (
                      <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-5xl">🌍</div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-white/90 rounded-full px-3 py-1 text-xs font-semibold text-blue-700">
                      {pkg.availableSeats} seats left
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{pkg.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{pkg.destination}</span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{pkg.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pkg.duration} days</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{pkg.availableSeats} seats</span>
                      </div>
                      <span className="text-blue-600 font-bold text-lg">₹{pkg.price.toLocaleString()}</span>
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
