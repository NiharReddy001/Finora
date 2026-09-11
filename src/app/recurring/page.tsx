'use client';

import React, { useState } from 'react';
import {
  Plus,
  Tv,
  Zap,
  Calendar,
  X,
  Edit2,
  Trash2,
  Power,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import {
  RecurringPayment,
  RecurringFrequency,
  RecurringType,
  ExpenseCategory,
} from '@/types/finance';
import {
  calculateRecurringTotals,
  formatCurrency,
  formatDisplayDate,
} from '@/lib/selectors';
import { ALL_EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/data/mockData';

export default function RecurringPage() {
  const {
    recurring,
    currency,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleRecurringStatus,
  } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringPayment | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('Monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState('2026-09-20');
  const [category, setCategory] = useState<ExpenseCategory>('Subscriptions');
  const [type, setType] = useState<RecurringType>('subscription');

  const totals = calculateRecurringTotals(recurring);

  const subscriptions = recurring.filter((r) => r.type === 'subscription');
  const bills = recurring.filter((r) => r.type === 'bill');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || parseFloat(amount) <= 0) return;

    addRecurring({
      name,
      amount: parseFloat(amount),
      frequency,
      nextPaymentDate,
      category,
      type,
      status: 'active',
    });

    // Reset
    setName('');
    setAmount('');
    setIsAddOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !name || !amount) return;

    updateRecurring({
      ...editingItem,
      name,
      amount: parseFloat(amount),
      frequency,
      nextPaymentDate,
      category,
      type,
    });

    setEditingItem(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 motion-header">
            Recurring Payments
          </h1>
          <p className="text-sm text-slate-600 mt-1 motion-supporting font-medium">
            Manage digital subscriptions, recurring liabilities, and scheduled capital commitments.
          </p>
        </div>
        <button
          onClick={() => {
            setName('');
            setAmount('');
            setFrequency('Monthly');
            setType('subscription');
            setCategory('Subscriptions');
            setIsAddOpen(true);
          }}
          className="motion-supporting tactile-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Recurring Payment
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 motion-primary">
        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Monthly Cost
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totals.monthlyTotal, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Across {totals.activeCount} active recurring payments
          </p>
        </div>

        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Subscriptions
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totals.subscriptionsTotal, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {subscriptions.filter((s) => s.status === 'active').length} active services
          </p>
        </div>

        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Bills & Rent
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totals.billsTotal, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {bills.filter((b) => b.status === 'active').length} active essential bills
          </p>
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="space-y-4 motion-main">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Digital Subscriptions ({subscriptions.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((item) => {
            const catColor = CATEGORY_COLORS[item.category] || '#10B981';
            const isActive = item.status === 'active';

            return (
              <div
                key={item.id}
                className={`rounded-xl p-5 flex flex-col justify-between transition-opacity ${
                  isActive
                    ? 'surface-l1'
                    : 'surface-l1 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: catColor }}
                      />
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => toggleRecurringStatus(item.id)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                        isActive
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-slate-500 bg-slate-100 border border-slate-200'
                      }`}
                      title={isActive ? 'Pause commitment' : 'Resume commitment'}
                    >
                      <Power className="w-3 h-3" />
                      {isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <p className="text-2xl font-bold text-slate-900 mt-3">
                    {formatCurrency(item.amount, currency)}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      /{item.frequency.toLowerCase()}
                    </span>
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Next:{' '}
                      {formatDisplayDate(item.nextPaymentDate)}
                    </span>
                    <span className="text-slate-500">{item.category}</span>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setName(item.name);
                      setAmount(item.amount.toString());
                      setFrequency(item.frequency);
                      setNextPaymentDate(item.nextPaymentDate);
                      setCategory(item.category);
                      setType(item.type);
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRecurring(item.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Living Essentials & Bills Section */}
      <div className="space-y-4 motion-secondary">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-slate-900">
            Essential Bills & Rent ({bills.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.map((item) => {
            const catColor = CATEGORY_COLORS[item.category] || '#F59E0B';
            const isActive = item.status === 'active';

            return (
              <div
                key={item.id}
                className={`rounded-xl p-5 flex flex-col justify-between transition-opacity ${
                  isActive
                    ? 'surface-l1'
                    : 'surface-l1 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: catColor }}
                      />
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => toggleRecurringStatus(item.id)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                        isActive
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-slate-500 bg-slate-100 border border-slate-200'
                      }`}
                      title={isActive ? 'Pause bill' : 'Resume bill'}
                    >
                      <Power className="w-3 h-3" />
                      {isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <p className="text-2xl font-bold text-slate-900 mt-3">
                    {formatCurrency(item.amount, currency)}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      /{item.frequency.toLowerCase()}
                    </span>
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due:{' '}
                      {formatDisplayDate(item.nextPaymentDate)}
                    </span>
                    <span className="text-slate-500">{item.category}</span>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setName(item.name);
                      setAmount(item.amount.toString());
                      setFrequency(item.frequency);
                      setNextPaymentDate(item.nextPaymentDate);
                      setCategory(item.category);
                      setType(item.type);
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRecurring(item.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Recurring Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs animate-backdrop-in"
            onClick={() => setIsAddOpen(false)}
          />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10 space-y-4 animate-modal-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                Add Recurring Payment
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('subscription');
                      setCategory('Subscriptions');
                    }}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      type === 'subscription'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Subscription
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('bill');
                      setCategory('Bills');
                    }}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      type === 'bill'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Bill / Rent
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Name / Service *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Electricity Board"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Amount ({currency === 'INR' ? '₹' : currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="649"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) =>
                      setFrequency(e.target.value as RecurringFrequency)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Next Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ExpenseCategory)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {ALL_EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Recurring Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setEditingItem(null)}
          />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                Edit Payment: {editingItem.name}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Name / Service
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Amount ({currency === 'INR' ? '₹' : currency})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) =>
                      setFrequency(e.target.value as RecurringFrequency)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ExpenseCategory)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {ALL_EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
