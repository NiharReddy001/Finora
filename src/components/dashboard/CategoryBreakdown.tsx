'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { calculateCategoryBreakdown, formatCurrency } from '@/lib/selectors';
import { ExpenseCategory } from '@/types/finance';

export default function CategoryBreakdown() {
  const { transactions, dateRange, currency, openCategoryDetail } =
    useFinance();

  const categories = calculateCategoryBreakdown(transactions, dateRange);

  return (
    <div className="surface-l2 rounded-xl p-5 flex flex-col justify-between border border-slate-200/90 shadow-xs tactile-card">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-950">
              Category Breakdown
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Click a category to inspect transactions
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100/90 border border-slate-200/80 text-slate-700">
            {categories.length} categories
          </span>
        </div>

        {/* Stacked multi-color percentage bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-100 flex overflow-hidden mb-5">
          {categories.map((cat) => (
            <div
              key={cat.category}
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
              className="h-full transition-all duration-300"
              title={`${cat.category}: ${cat.percentage}%`}
            />
          ))}
        </div>

        {/* Category List */}
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => openCategoryDetail(cat.category as ExpenseCategory)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-900/[0.035] tactile-row transition-all group text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-150 group-hover:scale-125"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-slate-950">
                  {cat.category}
                </span>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  ({cat.count})
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs font-bold text-slate-950">
                  {formatCurrency(cat.amount, currency)}
                </span>
                <span className="text-xs text-slate-600 font-medium w-8 text-right">
                  {cat.percentage}%
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

