'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users, CreditCard,
  Globe, LogOut, ChevronRight, Menu, X, Star, Tag, Sparkles, Compass
} from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin/bookings', label: 'Bookings', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/vip', label: 'VIP Club & Deals', icon: Sparkles },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        {/* Brand Logo matching Homepage */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-white text-base tracking-tight">TripEase</p>
            <p className="text-[11px] text-purple-400 font-semibold tracking-wider uppercase">Admin Control</p>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-purple-400 transition-colors'}`} />
                <span>{label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto text-white/80" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Quick Links */}
        <div className="px-4 py-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/20">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-rose-400 text-xs font-semibold py-2 px-3 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <Link
            href="/"
            className="w-full flex items-center gap-2 text-slate-400 hover:text-purple-400 text-xs font-semibold py-2 px-3 rounded-xl hover:bg-slate-800/80 transition-colors mt-1"
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
        {/* Top bar matching website frosted glass aesthetic */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button className="lg:hidden text-slate-700 dark:text-slate-300" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {navItems.find((n) => n.href === pathname)?.label || 'Admin Control'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 text-xs font-bold px-3 py-1 rounded-full">
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
