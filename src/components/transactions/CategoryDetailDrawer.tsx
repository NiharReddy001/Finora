'use client';

import React from 'react';
import { X, ArrowRight, Tag } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { CATEGORY_COLORS } from '@/data/mockData';
import {
  filterTransactionsByDateRange,
  formatCurrency,
  formatDisplayDate,
} from '@/lib/selectors';

export default function CategoryDetailDrawer() {
  const {
    selectedCategory,
    isCategoryDrawerOpen,
    closeCategoryDetail,
    transactions,
    dateRange,
    currency,
    openTransactionDetail,
  } = useFinance();

  if (!isCategoryDrawerOpen || !selectedCategory) return null;

  const currentTxs = filterTransactionsByDateRange(transactions, dateRange);
  const categoryTransactions = currentTxs.filter(
    (tx) => tx.type === 'expense' && tx.category === selectedCategory
  );
  const totalCategorySpent = categoryTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const totalAllExpenses = currentTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const percentage =
    totalAllExpenses > 0
      ? Math.round((totalCategorySpent / totalAllExpenses) * 100)
      : 0;

  const categoryColor = CATEGORY_COLORS[selectedCategory] || '#10B981';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs animate-backdrop-in"
        onClick={closeCategoryDetail}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-drawer-in">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: categoryColor }}
              />
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Category Drill-down
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedCategory}
                </h3>
              </div>
            </div>
            <button
              onClick={closeCategoryDetail}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Category Metric Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(totalCategorySpent, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    {percentage}% of total
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    {categoryTransactions.length} transactions
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions List for this category */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Transactions ({categoryTransactions.length})
                </h4>
                <span className="text-xs text-slate-400">
                  Click to inspect
                </span>
              </div>

              {categoryTransactions.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                  <Tag className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    No transactions recorded in {selectedCategory}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {categoryTransactions.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => {
                        closeCategoryDetail();
                        openTransactionDetail(tx);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors text-left group"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {tx.merchant}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span>{formatDisplayDate(tx.date)}</span>
                          <span>•</span>
                          <span>{tx.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-slate-900">
                          -{formatCurrency(tx.amount, currency)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

