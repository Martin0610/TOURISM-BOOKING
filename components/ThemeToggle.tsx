'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userCustomTheme = sessionStorage.getItem('user_custom_theme');
      if (!userCustomTheme) {
        setTheme('system');
      }
    }
  }, [setTheme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
    );
  }

  const options = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
        title="Switch theme"
        aria-label="Switch theme"
      >
        {theme === 'system' ? (
          <Monitor className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        ) : theme === 'dark' ? (
          <Moon className="w-4 h-4 text-slate-200" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('user_custom_theme', opt.value);
                  }
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs font-medium flex items-center justify-between transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
