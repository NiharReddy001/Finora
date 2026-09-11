'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '@/context/FinanceContext';
import { calculateSpendingTimeseries, formatCurrency } from '@/lib/selectors';

interface SpendingChartProps {
  title?: string;
}

export default function SpendingChart({
  title = 'Spending Overview',
}: SpendingChartProps) {
  const { transactions, dateRange, currency } = useFinance();
  const [chartType, setChartType] = useState<'daily' | 'cumulative'>('daily');

  const data = calculateSpendingTimeseries(transactions, dateRange);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs space-y-1">
          <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
            {dataPoint.dayLabel} ({dataPoint.date})
          </p>
          {chartType === 'daily' ? (
            <>
              <p className="flex items-center justify-between gap-4 text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Expenses:
                </span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(dataPoint.spent, currency)}
                </span>
              </p>
              {dataPoint.income > 0 && (
                <p className="flex items-center justify-between gap-4 text-emerald-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Income:
                  </span>
                  <span className="font-semibold">
                    +{formatCurrency(dataPoint.income, currency)}
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className="flex items-center justify-between gap-4 text-emerald-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Cumulative Spend:
              </span>
              <span className="font-semibold">
                {formatCurrency(dataPoint.cumulative, currency)}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-l2 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily and cumulative spending across the selected period
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType('daily')}
            className={`px-3 py-1 rounded-md transition-colors ${
              chartType === 'daily'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Spend
          </button>
          <button
            type="button"
            onClick={() => setChartType('cumulative')}
            className={`px-3 py-1 rounded-md transition-colors ${
              chartType === 'cumulative'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cumulative
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'daily' ? (
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="dayLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `₹${val > 999 ? `${Math.round(val / 1000)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="spent"
                fill="#059669"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSpentEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="dayLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `₹${val > 999 ? `${Math.round(val / 1000)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSpentEmerald)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

