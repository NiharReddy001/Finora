'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Edit2,
  Check,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
} from '@/types/finance';
import { ALL_EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/data/mockData';
import { formatCurrency, formatDisplayDate } from '@/lib/selectors';

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

export default function TransactionDrawer() {
  const {
    selectedTransaction,
    isTransactionDrawerOpen,
    closeTransactionDetail,
    updateTransaction,
    deleteTransaction,
    currency,
  } = useFinance();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (selectedTransaction) {
      setFormData(selectedTransaction);
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [selectedTransaction]);

  if (!isTransactionDrawerOpen || !selectedTransaction) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.merchant || !formData.amount) return;

    updateTransaction({
      ...selectedTransaction,
      ...formData,
      amount: Number(formData.amount),
    } as Transaction);

    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTransaction(selectedTransaction.id);
  };

  const isExpense = selectedTransaction.type === 'expense';
  const categoryColor =
    CATEGORY_COLORS[selectedTransaction.category as keyof typeof CATEGORY_COLORS] ||
    '#10B981';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs animate-backdrop-in"
        onClick={closeTransactionDetail}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-drawer-in">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                Transaction Details
              </span>
              <h3 className="text-base font-semibold text-slate-900 truncate">
                {selectedTransaction.merchant}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Edit Transaction"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeTransactionDetail}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!isEditing ? (
              <>
                {/* Amount Hero */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center">
                  <div className="inline-flex items-center justify-center p-2 rounded-full mb-3 bg-white border border-slate-200 shadow-xs">
                    {isExpense ? (
                      <ArrowDownLeft className="w-4 h-4 text-slate-600" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div
                    className={`text-3xl font-bold tracking-tight ${
                      isExpense ? 'text-slate-900' : 'text-emerald-600'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatCurrency(selectedTransaction.amount, currency)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 capitalize">
                    {selectedTransaction.type}
                  </p>
                </div>

                {/* Details List */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between py-2 border-b border-slate-100 text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5" /> Category
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: categoryColor }}
                      />
                      {selectedTransaction.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> Date
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatDisplayDate(selectedTransaction.date)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5" /> Method
                    </span>
                    <span className="font-medium text-slate-900">
                      {selectedTransaction.paymentMethod}
                    </span>
                  </div>

                  {selectedTransaction.account && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                      <span className="text-slate-500 flex items-center gap-2">
                        <Building className="w-3.5 h-3.5" /> Account
                      </span>
                      <span className="font-medium text-slate-900">
                        {selectedTransaction.account}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 text-xs">
                    <span className="text-slate-500 flex items-center gap-2 mb-1.5">
                      <FileText className="w-3.5 h-3.5" /> Notes
                    </span>
                    <p className="text-slate-700 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs leading-relaxed">
                      {selectedTransaction.notes || 'No notes added.'}
                    </p>
                  </div>
                </div>

                {/* Delete / Danger Zone */}
                <div className="pt-6 border-t border-slate-200">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Transaction
                    </button>
                  ) : (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center space-y-3">
                      <p className="text-xs text-rose-700 font-medium">
                        Are you sure you want to delete this transaction?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="flex-1 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-xs font-medium text-white transition-colors"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: 'expense',
                          category: 'Food',
                        })
                      }
                      className={`py-2 px-3 rounded-lg border transition-colors ${
                        formData.type === 'expense'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: 'income',
                          category: 'Salary',
                        })
                      }
                      className={`py-2 px-3 rounded-lg border transition-colors ${
                        formData.type === 'income'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Merchant / Payee
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.merchant || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, merchant: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Amount ({currency === 'INR' ? '₹' : currency})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formData.amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || 'Food'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as TransactionCategory,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {formData.type === 'expense'
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
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod || 'UPI'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value as PaymentMethod,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

