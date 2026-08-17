'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HeroButtons() {
  const { user, loading } = useAuth();

  // Don't show anything while auth is loading to avoid flash
  if (loading) return null;

  // Already logged in — show My Bookings instead
  if (user) {
    return (
      <Link
        href="/my-bookings"
        className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 text-lg"
      >
        My Bookings
      </Link>
    );
  }

  // Guest — show Create Account
  return (
    <Link
      href="/register"
      className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 text-lg"
    >
      Create Account
    </Link>
  );
}
