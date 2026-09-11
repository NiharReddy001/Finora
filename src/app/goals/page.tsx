'use client';

import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  X,
  Edit2,
  Trash2,
  Coins,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Goal } from '@/types/finance';
import { formatCurrency, formatDisplayDate } from '@/lib/selectors';

export default function GoalsPage() {
  const { goals, currency, addGoal, updateGoal, deleteGoal, addFundsToGoal } =
    useFinance();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [description, setDescription] = useState('');

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallProgress =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) return;

    addGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline,
      description: description.trim(),
    });

    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDescription('');
    setIsCreateOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !name || !targetAmount) return;

    updateGoal({
      ...editingGoal,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline,
      description: description.trim(),
    });

    setEditingGoal(null);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !depositAmount || parseFloat(depositAmount) <= 0) return;

    const amount = parseFloat(depositAmount);
    addFundsToGoal(selectedGoal.id, amount);
    setSelectedGoal({
      ...selectedGoal,
      currentAmount: selectedGoal.currentAmount + amount,
    });
    setDepositAmount('');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 motion-header">
            Savings Goals
          </h1>
          <p className="text-sm text-slate-600 mt-1 motion-supporting font-medium">
            Track progress towards capital reserve targets and financial milestones.
          </p>
        </div>
        <button
          onClick={() => {
            setName('');
            setTargetAmount('');
            setCurrentAmount('');
            setDescription('');
            setDeadline('2026-12-31');
            setIsCreateOpen(true);
          }}
          className="motion-supporting tactile-btn inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {/* Aggregate Goal Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 motion-primary">
        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Target
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalTarget, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across {goals.length} target goals</p>
        </div>

        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Saved
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {formatCurrency(totalSaved, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {formatCurrency(Math.max(0, totalTarget - totalSaved), currency)} to reach milestones
          </p>
        </div>

        <div className="surface-l1 tactile-card rounded-xl p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Overall Progress
          </span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl font-bold text-slate-900">
              {overallProgress}%
            </span>
            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Cumulative progress across all goals</p>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 motion-main">
        {goals.map((goal) => {
          const percentage = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="surface-l1 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm text-slate-900">
                    {goal.name}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {percentage}%
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {goal.description || 'Target savings reserve.'}
                </p>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <div>
                    <span className="text-slate-500">Saved</span>
                    <p className="font-semibold text-slate-900 text-sm">
                      {formatCurrency(goal.currentAmount, currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Target</span>
                    <p className="font-semibold text-slate-900 text-sm">
                      {formatCurrency(goal.targetAmount, currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 mt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due {formatDisplayDate(goal.deadline)}
                  </span>
                  <span>{formatCurrency(remaining, currency)} remaining</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedGoal(goal)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  <Coins className="w-3.5 h-3.5" /> Add Funds
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setName(goal.name);
                      setTargetAmount(goal.targetAmount.toString());
                      setCurrentAmount(goal.currentAmount.toString());
                      setDeadline(goal.deadline);
                      setDescription(goal.description);
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit Goal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Goal Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsCreateOpen(false)}
          />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                Create Savings Goal
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
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vacation Fund, Emergency Reserve"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Initial Deposit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Deadline
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="What is this goal for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setEditingGoal(null)}
          />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                Edit Goal: {editingGoal.name}
              </h3>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Goal Name
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
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Current (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Deadline
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
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

      {/* Goal Inspector / Allocate Funds Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSelectedGoal(null)}
          />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                {selectedGoal.name}
              </h3>
              <button
                onClick={() => setSelectedGoal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedGoal.description && (
              <p className="text-xs text-slate-500">
                {selectedGoal.description}
              </p>
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Saved</span>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(selectedGoal.currentAmount, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Target</span>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(selectedGoal.targetAmount, currency)}
                  </p>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
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

              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Deadline: {formatDisplayDate(selectedGoal.deadline)}</span>
                <span className="text-emerald-700 font-medium">
                  {Math.round(
                    (selectedGoal.currentAmount / selectedGoal.targetAmount) * 100
                  )}
                  % achieved
                </span>
              </div>
            </div>

            {/* Allocate Funds Form */}
            <form onSubmit={handleDeposit} className="space-y-3 pt-2 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Add Funds (₹)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="100"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoal(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
