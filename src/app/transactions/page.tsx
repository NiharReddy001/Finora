'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import {
  ALL_EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
} from '@/data/mockData';
import {
  formatCurrency,
  formatDisplayDate,
} from '@/lib/selectors';
import { PaymentMethod } from '@/types/finance';

const PAYMENT_METHODS: PaymentMethod[] = [
  'Credit Card',
  'UPI',
  'Debit Card',
  'Net Banking',
  'Cash',
];

export default function TransactionsPage() {
  const {
    transactions,
    currency,
    openTransactionDetail,
    openAddTransaction,
  } = useFinance();

  // Search, Filter, Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'merchant'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tx.notes &&
            tx.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
          tx.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          categoryFilter === 'all' || tx.category === categoryFilter;

        const matchesType = typeFilter === 'all' || tx.type === typeFilter;

        const matchesPayment =
          paymentFilter === 'all' || tx.paymentMethod === paymentFilter;

        return matchesSearch && matchesCategory && matchesType && matchesPayment;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = a.date.localeCompare(b.date);
        } else if (sortBy === 'amount') {
          comparison = a.amount - b.amount;
        } else if (sortBy === 'merchant') {
          comparison = a.merchant.localeCompare(b.merchant);
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });
  }, [
    transactions,
    searchTerm,
    categoryFilter,
    typeFilter,
    paymentFilter,
    sortBy,
    sortOrder,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setTypeFilter('all');
    setPaymentFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  const totalFilteredExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 motion-header">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-1 motion-supporting">
            Search, filter, inspect, and record all financial transactions.
          </p>
        </div>
        <button
          onClick={openAddTransaction}
          className="motion-supporting tactile-btn inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="surface-l3 rounded-xl p-4 space-y-3 motion-primary">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant, notes, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {ALL_EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
            </select>

            {/* Payment Method */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 border border-slate-300 rounded-lg p-0.5 bg-white">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'date' | 'amount' | 'merchant')
                }
                className="px-2 py-1 text-xs bg-transparent text-slate-700 focus:outline-none"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="merchant">Merchant</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                }
                className="p-1 rounded text-slate-500 hover:text-slate-800"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset */}
            {(searchTerm ||
              categoryFilter !== 'all' ||
              typeFilter !== 'all' ||
              paymentFilter !== 'all' ||
              sortBy !== 'date' ||
              sortOrder !== 'desc') && (
              <button
                onClick={resetFilters}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                title="Reset Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Stats */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900 font-semibold">{filteredTransactions.length}</strong> transactions
          </span>
          <div className="flex items-center gap-4">
            <span>
              Income: <strong className="text-emerald-600 font-semibold">+{formatCurrency(totalFilteredIncome, currency)}</strong>
            </span>
            <span>
              Expenses: <strong className="text-slate-900 font-semibold">-{formatCurrency(totalFilteredExpenses, currency)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="surface-l3 rounded-xl overflow-hidden motion-main">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-5">Merchant / Payee</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Account</th>
                <th className="py-2.5 px-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No transactions match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const catColor =
                    CATEGORY_COLORS[tx.category as keyof typeof CATEGORY_COLORS] ||
                    '#10B981';

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => openTransactionDetail(tx)}
                      className="tactile-row cursor-pointer group"
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              isExpense
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            {isExpense ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                              {tx.merchant}
                            </p>
                            {tx.notes && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                                {tx.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: catColor }}
                          />
                          {tx.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDisplayDate(tx.date)}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {tx.account || '—'}
                      </td>

                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold ${
                            isExpense ? 'text-slate-900' : 'text-emerald-600'
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
    </div>
  );
}

