'use client';

import React from 'react';
import DateRangeSelector from '@/components/ui/DateRangeSelector';
import SummaryCard from '@/components/ui/SummaryCard';
import SpendingChart from '@/components/charts/SpendingChart';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import RecentTransactionsTable from '@/components/dashboard/RecentTransactionsTable';
import UpcomingPaymentsList from '@/components/dashboard/UpcomingPaymentsList';
import SavingsGoalsList from '@/components/dashboard/SavingsGoalsList';
import ForexMarketReference from '@/components/dashboard/ForexMarketReference';
import { useFinance } from '@/context/FinanceContext';
import { calculateFinancialSummary, formatCurrency } from '@/lib/selectors';

export default function OverviewPage() {
  const { transactions, dateRange, currency, user } = useFinance();

  const summary = calculateFinancialSummary(transactions, dateRange);

  const getSubtitle = () => {
    switch (dateRange) {
      case '7D':
        return "Showing 7-day velocity and burn metrics";
      case '30D':
        return "Consolidated 30-day operating cashflow";
      case '90D':
        return "Quarterly performance overview (last 90 days)";
      case '1Y':
        return "Annual fiscal overview (trailing 365 days)";
      default:
        return "Consolidated financial intelligence & capital flow.";
    }
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Overview Hero Section: Left 7 cols for Identity & 2x2 Metric Cluster, Right 5 cols reserved for Financial Globe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Header, DateRangeSelector, and 2x2 Metric Cluster */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5">
          {/* Header with Date Range Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 motion-header">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                  Financial Overview
                </h1>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100/90 border border-slate-200/90 px-2.5 py-0.5 rounded-md tracking-tight">
                  Operational Matrix
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 motion-supporting font-medium">
                {getSubtitle()}
              </p>
            </div>

            <div className="motion-supporting shrink-0">
              <DateRangeSelector />
            </div>
          </div>

          {/* 2x2 Consolidated Metric Cluster */}
          {/* Top row: Net Worth & Savings Rate; Bottom row: Outflow & Inflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 motion-primary">
            <SummaryCard
              title="Net Worth"
              value={formatCurrency(summary.netWorth, currency)}
              changePercent={summary.netWorthChange}
              changeLabel="vs prior period"
            />
            <SummaryCard
              title="Savings Rate"
              value={`${summary.savingsRate}%`}
              changePercent={summary.savingsRateChange}
              changeLabel="vs prior period"
            />
            <SummaryCard
              title="Outflow"
              value={formatCurrency(summary.expenses, currency)}
              changePercent={summary.expensesChange}
              changeLabel="vs prior period"
              isInverseTrend={true}
            />
            <SummaryCard
              title="Inflow"
              value={formatCurrency(summary.income, currency)}
              changePercent={summary.incomeChange}
              changeLabel="vs prior period"
            />
          </div>
        </div>

        {/* Right Column: Dedicated Negative Space framing the Signature Financial Globe */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 min-h-[290px] relative items-start justify-end pointer-events-none pt-2">
          {/* Subtle live telemetry badge anchored to globe view */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-700 uppercase">
              Global Hub // 14 Nodes Synced
            </span>
          </div>
        </div>
      </div>

      {/* Main Analytical Spending Visualization & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 motion-main">
        <div className="lg:col-span-2">
          <SpendingChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryBreakdown />
        </div>
      </div>

      {/* Currency & FX Reference Section */}
      <div className="motion-secondary">
        <ForexMarketReference />
      </div>

      {/* Recent Ledger & Obligations + Capital Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 motion-secondary">
        <div className="lg:col-span-2">
          <RecentTransactionsTable />
        </div>
        <div className="lg:col-span-1 space-y-5">
          <UpcomingPaymentsList />
          <SavingsGoalsList />
        </div>
      </div>
    </div>
  );
}

