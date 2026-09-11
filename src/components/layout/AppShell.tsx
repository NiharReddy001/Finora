'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import FinancialCanvas from '@/components/layout/FinancialCanvas';
import FinancialGlobe from '@/components/layout/FinancialGlobe';
import TransactionDrawer from '@/components/transactions/TransactionDrawer';
import CategoryDetailDrawer from '@/components/transactions/CategoryDetailDrawer';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row relative">
      {/* Layer 1: Living Financial Environment Canvas (Grid, scattered fragments, ambient pulse) */}
      <FinancialCanvas />

      {/* Layer 2: Signature Financial Network Globe (Right-anchored, 3D rotating network) */}
      <FinancialGlobe />

      {/* Layer 4: Desktop Persistent Left Sidebar */}
      <Sidebar />

      {/* Layer 4: Mobile Navigation Header & Drawer (hidden on desktop) */}
      <MobileNav />

      {/* Layer 3: Main Content Viewport with Physical Spatial Transitions */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div key={pathname} className="page-transition-enter">
            {children}
          </div>
        </main>
      </div>

      {/* Layer 5: Global Drawers & Modals */}
      <TransactionDrawer />
      <CategoryDetailDrawer />
      <AddTransactionModal />
    </div>
  );
}
