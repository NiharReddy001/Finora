'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import {
  TransactionType,
  TransactionCategory,
  PaymentMethod,
} from '@/types/finance';
import { ALL_EXPENSE_CATEGORIES } from '@/data/mockData';

const INCOME_CATEGORIES: TransactionCategory[] = [
  'Salary',
  'Investments',
  'Freelance',
  'Other Income',
];
const PAYMENT_METHODS: PaymentMethod[] = [
  'Credit Card',
  'UPI',
  'Debit Card',
  'Net Banking',
  'Cash',
];

export default function AddTransactionModal() {
  const { isAddTransactionOpen, closeAddTransaction, addTransaction, currency } =
    useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [date, setDate] = useState('2026-09-11');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [account, setAccount] = useState('');

  if (!isAddTransactionOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount || parseFloat(amount) <= 0) return;

    addTransaction({
      merchant,
      amount: parseFloat(amount),
      category,
      date,
      type,
      paymentMethod,
      notes: notes.trim() || undefined,
      account: account.trim() || undefined,
    });

    setMerchant('');
    setAmount('');
    setNotes('');
    setAccount('');
    closeAddTransaction();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs animate-backdrop-in"
        onClick={closeAddTransaction}
      />

      <div className="relative bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 animate-modal-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Add Transaction
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record a new cash inflow or expense
            </p>
          </div>
          <button
            onClick={closeAddTransaction}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Type Toggle */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('Food');
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                  type === 'expense'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Expense (Outflow)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('Salary');
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                  type === 'income'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Income (Inflow)
              </button>
            </div>
          </div>

          {/* Merchant and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Merchant / Entity *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Swiggy, Amazon"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Amount ({currency === 'INR' ? '₹' : currency}) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as TransactionCategory)
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {type === 'expense'
                  ? ALL_EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  : INCOME_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Account (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank, ICICI CC"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Description, notes, or reference..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeAddTransaction}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

