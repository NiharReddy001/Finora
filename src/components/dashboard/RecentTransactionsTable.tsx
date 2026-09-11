'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Plus } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { CATEGORY_COLORS } from '@/data/mockData';
import {
  filterTransactionsByDateRange,
  formatCurrency,
  formatDisplayDate,
} from '@/lib/selectors';

export default function RecentTransactionsTable() {
  const {
    transactions,
    dateRange,
    currency,
    openTransactionDetail,
    openAddTransaction,
  } = useFinance();

  const currentTxs = filterTransactionsByDateRange(transactions, dateRange);
  const recentTxs = currentTxs.slice(0, 7);

  return (
    <div className="surface-l3 rounded-xl overflow-hidden border border-slate-200/90 shadow-xs tactile-card">
      <div className="p-5 border-b border-slate-200/90 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-950">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Click an entry to inspect, edit, or remove
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddTransaction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950 px-2 py-1.5 rounded-md hover:bg-slate-100/80 transition-colors"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200/90 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <th className="py-2.5 px-5">Merchant / Entity</th>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4">Method</th>
              <th className="py-2.5 px-5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentTxs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-xs text-slate-500 font-medium"
                >
                  No transactions recorded in this period.
                </td>
              </tr>
            ) : (
              recentTxs.map((tx) => {
                const isExpense = tx.type === 'expense';
                const catColor =
                  CATEGORY_COLORS[tx.category as keyof typeof CATEGORY_COLORS] ||
                  '#10B981';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => openTransactionDetail(tx)}
                    className="hover:bg-slate-900/[0.035] tactile-row cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            isExpense
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isExpense ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-950 truncate group-hover:text-emerald-800 transition-colors">
                            {tx.merchant}
                          </p>
                          {tx.notes && (
                            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[160px] sm:max-w-xs">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100/90 text-slate-800 border border-slate-200/70">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: catColor }}
                        />
                        {tx.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                      {formatDisplayDate(tx.date)}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>

                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <span
                        className={`text-xs font-bold ${
                          isExpense ? 'text-slate-950' : 'text-emerald-700'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

