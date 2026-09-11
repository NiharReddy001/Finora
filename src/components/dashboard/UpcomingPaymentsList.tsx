'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, X, Clock, Repeat, CheckCircle } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { RecurringPayment } from '@/types/finance';
import { formatCurrency, formatDisplayDate } from '@/lib/selectors';
import { CATEGORY_COLORS } from '@/data/mockData';

export default function UpcomingPaymentsList() {
  const { recurring, currency } = useFinance();
  const [selectedPayment, setSelectedPayment] = useState<RecurringPayment | null>(null);

  const upcomingList = recurring
    .filter((r) => r.status === 'active')
    .sort((a, b) => a.nextPaymentDate.localeCompare(b.nextPaymentDate))
    .slice(0, 4);

  return (
    <div className="surface-l1 rounded-xl p-5 border border-slate-200/90 shadow-xs tactile-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-950">
            Upcoming Payments
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Scheduled recurring commitments due soon
          </p>
        </div>
        <Link
          href="/recurring"
          className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950 px-2 py-1 rounded-md hover:bg-slate-100/80 transition-colors"
        >
          Manage <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {upcomingList.map((item) => {
          const catColor = CATEGORY_COLORS[item.category] || '#10B981';
          return (
            <button
              key={item.id}
              onClick={() => setSelectedPayment(item)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200/70 hover:border-slate-300/80 bg-slate-50/70 hover:bg-slate-900/[0.035] tactile-row transition-all text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: catColor }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-950 truncate group-hover:text-emerald-800 transition-colors">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                    <span>{formatDisplayDate(item.nextPaymentDate)}</span>
                    <span>•</span>
                    <span className="capitalize">{item.frequency}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-slate-950">
                  {formatCurrency(item.amount, currency)}
                </p>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  {item.type}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSelectedPayment(null)}
          />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Payment Details
              </span>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">
                {selectedPayment.name}
              </h4>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                {formatCurrency(selectedPayment.amount, currency)}
              </p>
            </div>

            <div className="space-y-2 text-xs py-2 border-y border-slate-100">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </span>
                <span className="font-medium text-slate-900">
                  {formatDisplayDate(selectedPayment.nextPaymentDate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Repeat className="w-3.5 h-3.5" /> Frequency
                </span>
                <span className="font-medium text-slate-900 capitalize">
                  {selectedPayment.frequency}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Category
                </span>
                <span className="font-medium text-slate-900">
                  {selectedPayment.category}
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Scheduled
              </span>
              <Link
                href="/recurring"
                onClick={() => setSelectedPayment(null)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Manage in Recurring &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

