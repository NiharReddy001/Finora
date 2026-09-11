export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Health'
  | 'Housing'
  | 'Subscriptions'
  | 'Other';

export type IncomeCategory = 'Salary' | 'Investments' | 'Freelance' | 'Other Income';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export type PaymentMethod =
  | 'Credit Card'
  | 'UPI'
  | 'Debit Card'
  | 'Net Banking'
  | 'Cash';

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  paymentMethod: PaymentMethod;
  notes?: string;
  account?: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  description: string;
}

export type RecurringFrequency = 'Monthly' | 'Quarterly' | 'Yearly';

export type RecurringType = 'subscription' | 'bill';

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  frequency: RecurringFrequency;
  nextPaymentDate: string; // YYYY-MM-DD
  category: ExpenseCategory;
  type: RecurringType;
  status: 'active' | 'paused';
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export type DateRangeOption = '7D' | '30D' | '90D' | '1Y';

export interface FinancialSummary {
  netWorth: number;
  netWorthChange: number; // percentage
  income: number;
  incomeChange: number;
  expenses: number;
  expensesChange: number;
  savingsRate: number; // percentage
  savingsRateChange: number;
}

export interface CategorySpending {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'info';
}
