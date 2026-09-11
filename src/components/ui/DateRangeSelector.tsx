'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { DateRangeOption } from '@/types/finance';

const OPTIONS: { label: string; value: DateRangeOption }[] = [
  { label: '7D', value: '7D' },
  { label: '30D', value: '30D' },
  { label: '90D', value: '90D' },
  { label: '1Y', value: '1Y' },
];

export default function DateRangeSelector() {
  const { dateRange, setDateRange } = useFinance();

  return (
    <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs">
      <div className="hidden sm:flex items-center gap-1 px-2 text-slate-400">
        <Calendar className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-center gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDateRange(opt.value)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              dateRange === opt.value
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

