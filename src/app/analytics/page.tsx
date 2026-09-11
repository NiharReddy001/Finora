'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Sparkles,
  ChevronRight,
  Store,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import {
  calculateMonthlyTrends,
  calculateCategoryBreakdown,
  calculateTopMerchants,
  generateFinancialInsights,
  formatCurrency,
} from '@/lib/selectors';
import { ExpenseCategory } from '@/types/finance';

export default function AnalyticsPage() {
  const {
    transactions,
    budgets,
    recurring,
    currency,
    dateRange,
    openCategoryDetail,
  } = useFinance();

  const monthlyTrends = calculateMonthlyTrends(transactions);
  const categoryBreakdown = calculateCategoryBreakdown(transactions, dateRange);
  const topMerchants = calculateTopMerchants(transactions, dateRange);
  const insights = generateFinancialInsights(transactions, budgets, recurring);

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs space-y-1">
          <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
            {label}
          </p>
          <p className="text-emerald-600 font-medium">
            Inflow: {formatCurrency(payload[0]?.value || 0, currency)}
          </p>
          <p className="text-slate-600 font-medium">
            Outflow: {formatCurrency(payload[1]?.value || 0, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 motion-header">
          Financial Analytics
        </h1>
        <p className="text-sm text-slate-600 mt-1 motion-supporting font-medium">
          Cash flow trends, spending distributions, and algorithmic insights.
        </p>
      </div>

      {/* Dynamic Financial Insights */}
      <div className="surface-l2 rounded-xl p-5 border border-slate-200/90 shadow-xs motion-primary">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Automated Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => {
            const Icon =
              insight.type === 'positive'
                ? CheckCircle2
                : insight.type === 'warning'
                ? AlertCircle
                : Info;

            const iconStyle =
              insight.type === 'positive'
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : insight.type === 'warning'
                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                : 'text-slate-700 bg-slate-100 border border-slate-200';

            return (
              <div
                key={insight.id}
                className="p-4 rounded-lg border border-slate-100 bg-slate-50/60 space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md ${iconStyle}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    {insight.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  {insight.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 motion-main">
        {/* Income vs Expenses Over Time */}
        <div className="surface-l2 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Income vs Expenses
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical monthly volume comparison
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyTrends}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#94A3B8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Savings Trend */}
        <div className="surface-l2 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Net Savings Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly retained savings trajectory
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrends}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="analyticsSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [
                    formatCurrency(Number(val), currency),
                    'Net Saved',
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#0F172A',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  name="Net Saved"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#analyticsSavingsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Spending By Category & Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 motion-secondary">
        {/* Interactive Category Breakdown */}
        <div className="surface-l2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Spending by Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any category to inspect transactions
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Interactive
            </span>
          </div>

          <div className="space-y-2">
            {categoryBreakdown.map((cat) => (
              <button
                key={cat.category}
                onClick={() =>
                  openCategoryDetail(cat.category as ExpenseCategory)
                }
                className="tactile-card w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {cat.category}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {cat.count} transactions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">
                      {formatCurrency(cat.amount, currency)}
                    </p>
                    <p className="text-[11px] text-slate-500">{cat.percentage}% of total</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Merchants Leaderboard */}
        <div className="surface-l2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Top Merchants
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Merchants ranked by total amount spent
              </p>
            </div>
            <Store className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2">
            {topMerchants.map((m, idx) => (
              <div
                key={m.merchant}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {m.merchant}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{m.category}</span>
                      <span>•</span>
                      <span>{m.count} payments</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-slate-900">
                    {formatCurrency(m.amount, currency)}
                  </p>
                  <p className="text-[11px] text-slate-500">{m.percentage}% of total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
