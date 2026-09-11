'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Target, ChevronRight, X, Calendar, Plus } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Goal } from '@/types/finance';
import { formatCurrency, formatDisplayDate } from '@/lib/selectors';

export default function SavingsGoalsList() {
  const { goals, currency, addFundsToGoal } = useFinance();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !depositAmount || parseFloat(depositAmount) <= 0) return;

    addFundsToGoal(selectedGoal.id, parseFloat(depositAmount));
    setSelectedGoal({
      ...selectedGoal,
      currentAmount: selectedGoal.currentAmount + parseFloat(depositAmount),
    });
    setDepositAmount('');
    setShowAddFunds(false);
  };

  return (
    <div className="surface-l1 rounded-xl p-5 border border-slate-200/90 shadow-xs tactile-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-950">
            Savings Goals
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Active milestones and capital reserve targets
          </p>
        </div>
        <Link
          href="/goals"
          className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950 px-2 py-1 rounded-md hover:bg-slate-100/80 transition-colors"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const percentage = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );

          return (
            <button
              key={goal.id}
              onClick={() => {
                setSelectedGoal(goal);
                setShowAddFunds(false);
              }}
              className="w-full text-left p-3 rounded-lg border border-slate-200/70 hover:border-slate-300/80 bg-slate-50/70 hover:bg-slate-900/[0.035] tactile-row transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-950 group-hover:text-emerald-800 transition-colors">
                  {goal.name}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-200/90 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>
                  {formatCurrency(goal.currentAmount, currency)} /{' '}
                  {formatCurrency(goal.targetAmount, currency)}
                </span>
                <span className="text-slate-400">
                  Due {formatDisplayDate(goal.deadline)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSelectedGoal(null)}
          />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Goal Inspector
              </span>
              <button
                onClick={() => setSelectedGoal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">
                {selectedGoal.name}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {selectedGoal.description}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Saved</span>
                  <p className="text-xl font-bold text-emerald-700">
                    {formatCurrency(selectedGoal.currentAmount, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Target</span>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(selectedGoal.targetAmount, currency)}
                  </p>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (selectedGoal.currentAmount / selectedGoal.targetAmount) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline:
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDisplayDate(selectedGoal.deadline)}
                </span>
              </div>
            </div>

            {/* Add Funds Form */}
            {!showAddFunds ? (
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Allocate Funds
                </button>
                <Link
                  href="/goals"
                  onClick={() => setSelectedGoal(null)}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Manage
                </Link>
              </div>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Deposit Amount ({currency === 'INR' ? '₹' : currency})
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="100"
                    placeholder="e.g. 5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFunds(false)}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    Confirm Deposit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

