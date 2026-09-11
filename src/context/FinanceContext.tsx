'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  Budget,
  Goal,
  RecurringPayment,
  UserProfile,
  DateRangeOption,
  ExpenseCategory,
} from '@/types/finance';
import {
  INITIAL_USER,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_RECURRING,
} from '@/data/mockData';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  recurring: RecurringPayment[];
  user: UserProfile;
  dateRange: DateRangeOption;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';

  // Modal / Drawer state
  selectedTransaction: Transaction | null;
  isTransactionDrawerOpen: boolean;
  selectedCategory: ExpenseCategory | null;
  isCategoryDrawerOpen: boolean;
  isAddTransactionOpen: boolean;

  // Actions
  setDateRange: (range: DateRangeOption) => void;
  setCurrency: (curr: string) => void;
  setDateFormat: (format: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateUser: (profile: Partial<UserProfile>) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  openTransactionDetail: (tx: Transaction) => void;
  closeTransactionDetail: () => void;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;

  // Category inspection
  openCategoryDetail: (category: ExpenseCategory) => void;
  closeCategoryDetail: () => void;

  // Budgets
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;

  // Goals
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
  addFundsToGoal: (id: string, amount: number) => void;

  // Recurring
  addRecurring: (r: Omit<RecurringPayment, 'id'>) => void;
  updateRecurring: (r: RecurringPayment) => void;
  deleteRecurring: (id: string) => void;
  toggleRecurringStatus: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with canonical dataset
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [recurring, setRecurring] = useState<RecurringPayment[]>(INITIAL_RECURRING);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);

  // Hydrate client storage on mount
  useEffect(() => {
    try {
      const savedTxs = localStorage.getItem('finora_transactions');
      if (savedTxs) setTransactions(JSON.parse(savedTxs));

      const savedBudgets = localStorage.getItem('finora_budgets');
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));

      const savedGoals = localStorage.getItem('finora_goals');
      if (savedGoals) setGoals(JSON.parse(savedGoals));

      const savedRecurring = localStorage.getItem('finora_recurring');
      if (savedRecurring) setRecurring(JSON.parse(savedRecurring));

      const savedUser = localStorage.getItem('finora_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error('Error hydrating state from localStorage', e);
    }
  }, []);

  const [dateRange, setDateRange] = useState<DateRangeOption>('30D');
  const [currency, setCurrency] = useState<string>('INR');
  const [dateFormat, setDateFormat] = useState<string>('DD/MM/YYYY');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Modal / Drawer state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTransactionDrawerOpen, setIsTransactionDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('finora_transactions', JSON.stringify(transactions));
      } catch {}
    }
  }, [transactions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('finora_budgets', JSON.stringify(budgets));
      } catch {}
    }
  }, [budgets]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('finora_goals', JSON.stringify(goals));
      } catch {}
    }
  }, [goals]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('finora_recurring', JSON.stringify(recurring));
      } catch {}
    }
  }, [recurring]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('finora_user', JSON.stringify(user));
      } catch {}
    }
  }, [user]);

  // Handle theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Transaction handlers
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
    if (selectedTransaction?.id === updatedTx.id) {
      setSelectedTransaction(updatedTx);
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    if (selectedTransaction?.id === id) {
      setIsTransactionDrawerOpen(false);
      setSelectedTransaction(null);
    }
  };

  const openTransactionDetail = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsTransactionDrawerOpen(true);
  };

  const closeTransactionDetail = () => {
    setIsTransactionDrawerOpen(false);
    setSelectedTransaction(null);
  };

  const openAddTransaction = () => setIsAddTransactionOpen(true);
  const closeAddTransaction = () => setIsAddTransactionOpen(false);

  // Category inspect handlers
  const openCategoryDetail = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setIsCategoryDrawerOpen(true);
  };

  const closeCategoryDetail = () => {
    setIsCategoryDrawerOpen(false);
    setSelectedCategory(null);
  };

  // Budget handlers
  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...b,
      id: `b-${Date.now()}`,
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (updated: Budget) => {
    setBudgets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Goal handlers
  const addGoal = (g: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...g,
      id: `g-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (updated: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addFundsToGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
  };

  // Recurring handlers
  const addRecurring = (r: Omit<RecurringPayment, 'id'>) => {
    const newRec: RecurringPayment = {
      ...r,
      id: `rec-${Date.now()}`,
    };
    setRecurring((prev) => [...prev, newRec]);
  };

  const updateRecurring = (updated: RecurringPayment) => {
    setRecurring((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const deleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRecurringStatus = (id: string) => {
    setRecurring((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'active' ? 'paused' : 'active' }
          : r
      )
    );
  };

  const updateUser = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        recurring,
        user,
        dateRange,
        currency,
        dateFormat,
        theme,
        selectedTransaction,
        isTransactionDrawerOpen,
        selectedCategory,
        isCategoryDrawerOpen,
        isAddTransactionOpen,
        setDateRange,
        setCurrency,
        setDateFormat,
        setTheme,
        updateUser,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        openTransactionDetail,
        closeTransactionDetail,
        openAddTransaction,
        closeAddTransaction,
        openCategoryDetail,
        closeCategoryDetail,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addFundsToGoal,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        toggleRecurringStatus,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
