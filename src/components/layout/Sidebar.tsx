'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  PieChart,
  Target,
  Repeat,
  Settings,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { FinoraBrandMark } from '@/components/brand/FinoraBrandMark';

const NAV_ITEMS = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Budgets', href: '/budgets', icon: PieChart },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Recurring', href: '/recurring', icon: Repeat },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useFinance();

  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  // Active indicator positioning state (Single persistent traveling object)
  const [activeIndicator, setActiveIndicator] = useState<{ top: number; height: number; ready: boolean }>({
    top: 0,
    height: 40,
    ready: false,
  });

  // Floating hover indicator state
  const [hoverIndicator, setHoverIndicator] = useState<{ top: number; height: number; visible: boolean }>({
    top: 0,
    height: 40,
    visible: false,
  });

  // Calculate active index based on pathname
  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.href === '/') return pathname === '/';
    return pathname.startsWith(item.href);
  });

  // Update active indicator position
  const updateActivePosition = useCallback((index: number) => {
    const el = itemRefs.current[index];
    if (el) {
      setActiveIndicator({
        top: el.offsetTop,
        height: el.offsetHeight,
        ready: true,
      });
    }
  }, []);

  // Update on route change and resize
  useEffect(() => {
    const idx = activeIndex >= 0 ? activeIndex : 0;
    updateActivePosition(idx);

    const handleResize = () => {
      updateActivePosition(idx);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, updateActivePosition]);

  // Handle immediate indicator movement on click (feels connected to route navigation)
  const handleItemClick = (index: number) => {
    updateActivePosition(index);
    setHoverIndicator((prev) => ({ ...prev, visible: false }));
  };

  // Handle hover on non-active items
  const handleItemHover = (index: number) => {
    if (index === activeIndex) {
      setHoverIndicator((prev) => ({ ...prev, visible: false }));
      return;
    }
    const el = itemRefs.current[index];
    if (el) {
      setHoverIndicator({
        top: el.offsetTop,
        height: el.offsetHeight,
        visible: true,
      });
    }
  };

  const handleNavLeave = () => {
    setHoverIndicator((prev) => ({ ...prev, visible: false }));
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 md:h-screen md:sticky md:top-0 surface-l4 border-r border-slate-200/80 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200/80">
        <Link href="/" className="flex items-center gap-3 group">
          <FinoraBrandMark
            size={32}
            variant="badge-emerald"
            className="transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-slate-950 text-[15px] leading-none">
              Finora
            </span>
            <span className="text-[9.5px] uppercase tracking-[0.14em] text-emerald-700 font-semibold mt-1 leading-none">
              Finance Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation instrument track */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3 py-4">
        <nav
          ref={navContainerRef}
          onMouseLeave={handleNavLeave}
          className="relative space-y-1"
        >
          {/* 1. Single Persistent Traveling Active Indicator */}
          <div
            className="absolute left-0 right-0 rounded-lg pointer-events-none transition-all duration-280 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
            style={{
              transform: `translateY(${activeIndicator.top}px)`,
              height: `${activeIndicator.height}px`,
              opacity: activeIndicator.ready ? 1 : 0,
            }}
          >
            {/* Precision physical active surface */}
            <div className="w-full h-full rounded-lg bg-slate-900/[0.035] border border-slate-300/80 shadow-xs" />
            {/* Precision physical active rail indicator */}
            <div className="absolute left-1 top-2.5 bottom-2.5 w-[3px] rounded-full bg-emerald-600 shadow-xs" />
          </div>

          {/* 2. Floating Hover Surface (Tracks cursor between non-active items) */}
          <div
            className="absolute left-0 right-0 rounded-lg pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
            style={{
              transform: `translateY(${hoverIndicator.top}px)`,
              height: `${hoverIndicator.height}px`,
              opacity: hoverIndicator.visible ? 1 : 0,
            }}
          >
            <div className="w-full h-full rounded-lg bg-slate-900/[0.02] border border-slate-200/50" />
          </div>

          {/* Navigation Items */}
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeIndex;

            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => { itemRefs.current[index] = el; }}
                onClick={() => handleItemClick(index)}
                onMouseEnter={() => handleItemHover(index)}
                className={`group relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-180 ease-out active:scale-[0.985] ${
                  isActive
                    ? 'text-slate-950 font-semibold pl-4'
                    : 'text-slate-700 font-medium hover:text-slate-950'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? 'text-emerald-700 scale-105'
                      : 'text-slate-500 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:scale-105'
                  }`}
                />
                <span className="truncate tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Workspace Instrument at bottom */}
        <div className="pt-3 border-t border-slate-200/80">
          <Link
            href="/settings"
            className="tactile-card flex items-center gap-3 p-2.5 rounded-lg bg-white/40 hover:bg-white/80 border border-slate-200/70 hover:border-slate-300/80 transition-all duration-200 group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 tracking-wider">
              PT
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-950 truncate">
                {user.name || 'Primary Treasury'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Finora Workspace
              </p>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
