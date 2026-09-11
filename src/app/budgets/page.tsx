'use client';

import React, { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import {
  calculateBudgetUsage,
  formatCurrency,
} from '@/lib/selectors';
import { ALL_EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/data/mockData';
import { ExpenseCategory, Budget } from '@/types/finance';

export default function BudgetsPage() {
  const {
    budgets,
    transactions,
    dateRange,
    currency,
    addBudget,
    updateBudget,
    deleteBudget,
    openCategoryDetail,
  } = useFinance();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form states
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [limit, setLimit] = useState('');

  const budgetUsage = calculateBudgetUsage(budgets, transactions, dateRange);

  const totalBudgeted = budgetUsage.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetUsage.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const overallPercentage =
    totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || parseFloat(limit) <= 0) return;

    const existing = budgets.find((b) => b.category === category);
    if (existing) {
      updateBudget({
        ...existing,
        limit: parseFloat(limit),
      });
    } else {
      addBudget({
        category,
        limit: parseFloat(limit),
      });
    }

    setLimit('');
    setIsCreateOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget || !limit || parseFloat(limit) <= 0) return;

    updateBudget({
      ...editingBudget,
      limit: parseFloat(limit),
    });

    setEditingBudget(null);
    setLimit('');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 motion-header">
            Budgets
          </h1>
          <p className="text-sm text-slate-600 mt-1 motion-supporting font-medium">
            Establish category thresholds and monitor operating variance.
          </p>
        </div>
        <button
          onClick={() => {
            setLimit('');
            setIsCreateOpen(true);
          }}
          className="motion-supporting tactile-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" /> Create Budget
        </button>
      </div>

      {/* Aggregate Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 motion-primary">
        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Budgeted
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalBudgeted, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Sum of all category limits</p>
        </div>

        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Spent
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalSpent, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{overallPercentage}% of total limit</p>
        </div>

        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Remaining Buffer
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {formatCurrency(totalRemaining, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Available to spend</p>
        </div>

        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Overall Health
          </span>
          <div className="flex items-center gap-2 mt-2">
            {overallPercentage >= 100 ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600">
                <AlertCircle className="w-4 h-4" /> Over Budget
              </span>
            ) : overallPercentage >= 75 ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                <AlertTriangle className="w-4 h-4" /> Near Limit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                <CheckCircle className="w-4 h-4" /> Healthy
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {budgets.length} budget categories
          </p>
        </div>
      </div>

      {/* Individual Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 motion-main">
        {budgetUsage.map((item) => {
          const catColor = CATEGORY_COLORS[item.category] || '#64748b';

          const statusBadge =
            item.status === 'danger' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3 h-3" /> Over
              </span>
            ) : item.status === 'warning' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3 h-3" /> Near Limit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3 h-3" /> Healthy
              </span>
            );

          const progressBarColor =
            item.status === 'danger'
              ? 'bg-rose-500'
              : item.status === 'warning'
              ? 'bg-amber-500'
              : 'bg-emerald-500';

          return (
            <div
              key={item.id}
              className="surface-l2 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">
                        {item.category}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Limit: {formatCurrency(item.limit, currency)}
                      </p>
                    </div>
                  </div>
                  {statusBadge}
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-900">
                      {formatCurrency(item.spent, currency)} spent
                    </span>
                    <span className="text-slate-500">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${progressBarColor} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <span>
                    {item.remaining > 0
                      ? `${formatCurrency(item.remaining, currency)} remaining`
                      : `+${formatCurrency(item.spent - item.limit, currency)} over limit`}
                  </span>
                  <button
                    onClick={() => openCategoryDetail(item.category)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-xs hover:underline"
                  >
                    View details &rarr;
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => {
                    setEditingBudget({
                      id: item.id,
                      category: item.category,
                      limit: item.limit,
                    });
                    setLimit(item.limit.toString());
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Edit Limit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteBudget(item.id)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Budget"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Budget Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsCreateOpen(false)}
          />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                Create Category Budget
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
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
                  {ALL_EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  placeholder="e.g. 15000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setEditingBudget(null)}
          />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                Edit {editingBudget.category} Budget
              </h3>
              <button
                onClick={() => setEditingBudget(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBudget(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  Update Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
