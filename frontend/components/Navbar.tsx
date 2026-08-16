'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Globe, Phone, Heart } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Globe className="w-6 h-6" />
            TripEase
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <a href="tel:+917200336447" className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition text-sm">
              <Phone className="w-3.5 h-3.5" /> +91 72003 36447
            </a>
            <Link href="/packages" className="text-gray-600 hover:text-blue-600 transition">Packages</Link>
            {user ? (
              <>
                <Link href="/wishlist" className="text-gray-600 hover:text-red-500 transition flex items-center gap-1">
                  <Heart className="w-4 h-4" /> Wishlist
                </Link>
                <Link href="/my-bookings" className="text-gray-600 hover:text-blue-600 transition">My Bookings</Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-purple-600 hover:text-purple-800 font-medium transition">Admin</Link>
                )}
                <span className="text-gray-500 text-sm">Hi, {user.name}</span>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 transition">Login</Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/packages" className="text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Packages</Link>
            {user ? (
              <>
                <Link href="/my-bookings" className="text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>My Bookings</Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-purple-600 font-medium" onClick={() => setMenuOpen(false)}>Admin</Link>
                )}
                <button onClick={handleLogout} className="text-red-500 text-left">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/register" className="text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
