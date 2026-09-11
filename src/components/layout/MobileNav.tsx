'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  PieChart,
  Target,
  Repeat,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';

const NAV_ITEMS = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Budgets', href: '/budgets', icon: PieChart },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Recurring', href: '/recurring', icon: Repeat },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useFinance();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="md:hidden">
      {/* Mobile Top Header */}
      <header className="h-14 surface-l4 border-b border-slate-200/80 flex items-center justify-between px-4 sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-semibold tracking-tight text-slate-900 text-sm">
            Finora
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Slide-over Drawer Backdrop & Content */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs animate-backdrop-in"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full surface-l4 border-r border-slate-200/80 p-5 z-50 shadow-2xl animate-drawer-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-900 text-sm">
                  Finora
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 mt-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user.name || 'Your Finances'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Personal Workspace
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

