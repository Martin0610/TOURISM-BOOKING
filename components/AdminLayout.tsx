'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users, CreditCard,
  Globe, LogOut, ChevronRight, Menu, X, Star, Tag, Sparkles, Compass
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ThemeToggle from './ThemeToggle';

const navItems: {
  href: string;
  label: string;
  icon: any;
  badgeKey?: 'bookings' | 'reviews' | 'vip';
}[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin/bookings', label: 'Bookings', icon: ShoppingBag, badgeKey: 'bookings' },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, badgeKey: 'reviews' },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/vip', label: 'VIP Club & Deals', icon: Sparkles, badgeKey: 'vip' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<{ bookings?: number; reviews?: number; vip?: number }>({});

  // Mark current section as seen immediately when pathname changes
  useEffect(() => {
    if (pathname.startsWith('/admin/bookings')) {
      localStorage.setItem('admin_seen_bookings', Date.now().toString());
      setBadges((prev) => ({ ...prev, bookings: 0 }));
    } else if (pathname.startsWith('/admin/reviews')) {
      localStorage.setItem('admin_seen_reviews', Date.now().toString());
      setBadges((prev) => ({ ...prev, reviews: 0 }));
    } else if (pathname.startsWith('/admin/vip')) {
      localStorage.setItem('admin_seen_vip', Date.now().toString());
      setBadges((prev) => ({ ...prev, vip: 0 }));
    }
  }, [pathname]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const fetchNotifications = () => {
        const sinceBookings = localStorage.getItem('admin_seen_bookings') || '';
        const sinceReviews = localStorage.getItem('admin_seen_reviews') || '';
        const sinceVip = localStorage.getItem('admin_seen_vip') || '';

        const params: Record<string, string> = {};
        if (sinceBookings) params.sinceBookings = sinceBookings;
        if (sinceReviews) params.sinceReviews = sinceReviews;
        if (sinceVip) params.sinceVip = sinceVip;

        api.get('/api/admin/notifications', { params })
          .then((res) => {
            const data = res.data?.data || {};
            // Suppress badge if currently on that page
            if (pathname.startsWith('/admin/bookings')) data.bookings = 0;
            if (pathname.startsWith('/admin/reviews')) data.reviews = 0;
            if (pathname.startsWith('/admin/vip')) data.vip = 0;
            setBadges(data);
          })
          .catch(() => {});
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, pathname]);

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 shadow-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white text-base tracking-tight">TripEase</p>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Admin Control</p>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, badgeKey }) => {
            const active = pathname === href;
            const count = badgeKey ? badges[badgeKey] : 0;

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{label}</span>

                {/* Live Notification Badge */}
                {count && count > 0 ? (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px] ${
                    active
                      ? 'bg-white text-blue-700'
                      : badgeKey === 'vip'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                    {count}
                  </span>
                ) : active ? (
                  <ChevronRight className="w-4 h-4 ml-auto text-white/80 flex-shrink-0" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Quick Links */}
        <div className="px-4 py-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-rose-400 text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <Link
            href="/"
            className="w-full flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-800 transition-colors mt-1"
          >
            <Globe className="w-4 h-4" /> View Live Site
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button className="lg:hidden text-slate-700 dark:text-slate-300" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {navItems.find((n) => n.href === pathname)?.label || 'Admin Control'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">
              ADMINISTRATOR
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
