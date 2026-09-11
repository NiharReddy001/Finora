'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  changePercent: number;
  changeLabel?: string;
  isInverseTrend?: boolean;
}

export default function SummaryCard({
  title,
  value,
  changePercent,
  changeLabel = 'vs last period',
  isInverseTrend = false,
}: SummaryCardProps) {
  const isPositive = changePercent > 0;
  const isNeutral = changePercent === 0;

  // For expenses, a reduction (negative) is favorable
  const isFavorable = isInverseTrend ? !isPositive : isPositive;

  return (
    <div className="tactile-card rounded-xl p-5 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          {title}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md border ${
            isNeutral
              ? 'bg-slate-100 text-slate-700 border-slate-200/90'
              : isFavorable
              ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90'
              : 'bg-rose-50/90 text-rose-800 border-rose-200/90'
          }`}
        >
          {isNeutral ? (
            <Minus className="w-3 h-3" />
          ) : isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {Math.abs(changePercent)}%
        </span>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
          {value}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1.5">
          {changeLabel}
        </p>
      </div>
    </div>
  );
}

