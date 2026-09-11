import {
  Transaction,
  Budget,
  RecurringPayment,
  DateRangeOption,
  FinancialSummary,
  CategorySpending,
  ExpenseCategory,
  FinancialInsight,
} from '@/types/finance';
import { CATEGORY_COLORS, ALL_EXPENSE_CATEGORIES } from '@/data/mockData';

export function filterTransactionsByDateRange(
  transactions: Transaction[],
  dateRange: DateRangeOption = '30D'
): Transaction[] {
  const refDate = new Date('2026-09-11T23:59:59');
  return transactions.filter((tx) => {
    const txDate = new Date(`${tx.date}T00:00:00`);
    const diffMs = refDate.getTime() - txDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (dateRange === '7D') {
      return diffDays >= 0 && diffDays <= 7;
    }
    if (dateRange === '30D') {
      return diffDays >= 0 && diffDays <= 30;
    }
    if (dateRange === '90D') {
      return diffDays >= 0 && diffDays <= 90;
    }
    if (dateRange === '1Y') {
      return diffDays >= 0 && diffDays <= 365;
    }
    return true;
  });
}

export function getPreviousPeriodTransactions(
  transactions: Transaction[],
  dateRange: DateRangeOption = '30D'
): Transaction[] {
  const refDate = new Date('2026-09-11T23:59:59');
  return transactions.filter((tx) => {
    const txDate = new Date(`${tx.date}T00:00:00`);
    const diffMs = refDate.getTime() - txDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (dateRange === '7D') {
      return diffDays > 7 && diffDays <= 14;
    }
    if (dateRange === '30D') {
      return diffDays > 30 && diffDays <= 60;
    }
    if (dateRange === '90D') {
      return diffDays > 90 && diffDays <= 180;
    }
    if (dateRange === '1Y') {
      return diffDays > 365 && diffDays <= 730;
    }
    return false;
  });
}

export function calculateFinancialSummary(
  transactions: Transaction[],
  dateRange: DateRangeOption = '30D'
): FinancialSummary {
  const currentTxs = filterTransactionsByDateRange(transactions, dateRange);
  const prevTxs = getPreviousPeriodTransactions(transactions, dateRange);

  const income = currentTxs
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = currentTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0;

  // Previous period calculations
  const prevIncome = prevTxs
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0) || 121000;

  const prevExpenses = prevTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0) || 72100;

  const prevSavingsRate =
    prevIncome > 0 ? Math.max(0, Math.round(((prevIncome - prevExpenses) / prevIncome) * 100)) : 40;

  const incomeChange =
    prevIncome > 0
      ? Number((((income - prevIncome) / prevIncome) * 100).toFixed(1))
      : 0;

  const expensesChange =
    prevExpenses > 0
      ? Number((((expenses - prevExpenses) / prevExpenses) * 100).toFixed(1))
      : 0;

  const savingsRateChange = Number((savingsRate - prevSavingsRate).toFixed(1));

  // Base Net Worth of 8,42,500 for illustrative workspace
  const netSavingsDelta = income - expenses - (prevIncome - prevExpenses);
  const netWorth = 842500 + netSavingsDelta;
  const prevNetWorth = 808000;
  const netWorthChange = Number(
    (((netWorth - prevNetWorth) / prevNetWorth) * 100).toFixed(1)
  );

  return {
    netWorth,
    netWorthChange,
    income,
    incomeChange,
    expenses,
    expensesChange,
    savingsRate,
    savingsRateChange,
  };
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  dateRange: DateRangeOption = '30D'
): CategorySpending[] {
  const currentTxs = filterTransactionsByDateRange(transactions, dateRange);
  const expenseTxs = currentTxs.filter((tx) => tx.type === 'expense');
  const totalExpenses = expenseTxs.reduce((sum, tx) => sum + tx.amount, 0);

  const categoryTotals = ALL_EXPENSE_CATEGORIES.map((category) => {
    const catTxs = expenseTxs.filter((tx) => tx.category === category);
    const amount = catTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
    return {
      category,
      amount,
      percentage,
      count: catTxs.length,
      color: CATEGORY_COLORS[category],
    };
  });

  return categoryTotals
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export interface DailySpendingDataPoint {
  date: string;
  dayLabel: string;
  spent: number;
  income: number;
  cumulative: number;
}

export function calculateSpendingTimeseries(
  transactions: Transaction[],
  dateRange: DateRangeOption = '30D'
): DailySpendingDataPoint[] {
  const currentTxs = filterTransactionsByDateRange(transactions, dateRange);

  const dateMap: Record<string, { spent: number; income: number }> = {};
  const numDays = dateRange === '7D' ? 7 : dateRange === '30D' ? 30 : 90;
  const refDate = new Date('2026-09-11T12:00:00');

  if (dateRange === '7D' || dateRange === '30D') {
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dateMap[`${yyyy}-${mm}-${dd}`] = { spent: 0, income: 0 };
    }
  }

  currentTxs.forEach((tx) => {
    if (!dateMap[tx.date]) {
      dateMap[tx.date] = { spent: 0, income: 0 };
    }
    if (tx.type === 'expense') {
      dateMap[tx.date].spent += tx.amount;
    } else {
      dateMap[tx.date].income += tx.amount;
    }
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  let runningTotal = 0;

  return Object.keys(dateMap)
    .sort()
    .map((date) => {
      const parts = date.split('-');
      const mIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const spent = dateMap[date].spent;
      runningTotal += spent;
      return {
        date,
        dayLabel: `${monthNames[mIdx]} ${day}`,
        spent,
        income: dateMap[date].income,
        cumulative: runningTotal,
      };
    });
}

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export function calculateMonthlyTrends(
  transactions: Transaction[]
): MonthlyTrendPoint[] {
  const months = ['2026-07', '2026-08', '2026-09'];
  const monthNames: Record<string, string> = {
    '2026-07': 'July',
    '2026-08': 'August',
    '2026-09': 'September',
  };

  return months.map((m) => {
    const mTxs = transactions.filter((tx) => tx.date.startsWith(m));
    const income = mTxs
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0) || (m === '2026-07' ? 118000 : 0);
    const expenses = mTxs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0) || (m === '2026-07' ? 69400 : 0);
    return {
      month: monthNames[m],
      income,
      expenses,
      savings: Math.max(0, income - expenses),
    };
  });
}

export interface TopMerchantItem {
  merchant: string;
  amount: number;
  count: number;
  category: string;
  percentage: number;
}

export function calculateTopMerchants(
  transactions: Transaction[],
  dateRange: DateRangeOption = '30D'
): TopMerchantItem[] {
  const currentTxs = filterTransactionsByDateRange(transactions, dateRange);
  const expenseTxs = currentTxs.filter((tx) => tx.type === 'expense');
  const totalExpenses = expenseTxs.reduce((sum, tx) => sum + tx.amount, 0);

  const merchantMap: Record<
    string,
    { amount: number; count: number; category: string }
  > = {};

  expenseTxs.forEach((tx) => {
    if (!merchantMap[tx.merchant]) {
      merchantMap[tx.merchant] = {
        amount: 0,
        count: 0,
        category: tx.category,
      };
    }
    merchantMap[tx.merchant].amount += tx.amount;
    merchantMap[tx.merchant].count += 1;
  });

  return Object.entries(merchantMap)
    .map(([merchant, data]) => ({
      merchant,
      amount: data.amount,
      count: data.count,
      category: data.category,
      percentage: totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

export interface BudgetUsageItem {
  id: string;
  category: ExpenseCategory;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'healthy' | 'warning' | 'danger';
}

export function calculateBudgetUsage(
  budgets: Budget[],
  transactions: Transaction[],
  dateRange: DateRangeOption = '30D'
): BudgetUsageItem[] {
  const currentTxs = filterTransactionsByDateRange(transactions, dateRange);
  const expenseTxs = currentTxs.filter((tx) => tx.type === 'expense');

  return budgets.map((b) => {
    const spent = expenseTxs
      .filter((tx) => tx.category === b.category)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const remaining = Math.max(0, b.limit - spent);
    const percentage = Math.round((spent / b.limit) * 100);

    let status: 'healthy' | 'warning' | 'danger' = 'healthy';
    if (percentage >= 100) {
      status = 'danger';
    } else if (percentage >= 75) {
      status = 'warning';
    }

    return {
      id: b.id,
      category: b.category,
      limit: b.limit,
      spent,
      remaining,
      percentage,
      status,
    };
  });
}

export function calculateRecurringTotals(recurring: RecurringPayment[]) {
  const activeItems = recurring.filter((r) => r.status === 'active');
  const monthlyTotal = activeItems.reduce((sum, item) => {
    if (item.frequency === 'Monthly') return sum + item.amount;
    if (item.frequency === 'Quarterly') return sum + Math.round(item.amount / 3);
    if (item.frequency === 'Yearly') return sum + Math.round(item.amount / 12);
    return sum + item.amount;
  }, 0);

  const subscriptionsTotal = activeItems
    .filter((r) => r.type === 'subscription')
    .reduce((sum, r) => sum + r.amount, 0);

  const billsTotal = activeItems
    .filter((r) => r.type === 'bill')
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    monthlyTotal,
    subscriptionsTotal,
    billsTotal,
    activeCount: activeItems.length,
  };
}

export function generateFinancialInsights(
  transactions: Transaction[],
  budgets: Budget[],
  recurring: RecurringPayment[]
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const currentTxs = filterTransactionsByDateRange(transactions, '30D');
  const expenseTxs = currentTxs.filter((tx) => tx.type === 'expense');
  const totalExpenses = expenseTxs.reduce((s, tx) => s + tx.amount, 0);

  // 1. Top category insight
  const breakdown = calculateCategoryBreakdown(transactions, '30D');
  if (breakdown.length > 0) {
    const top = breakdown[0];
    insights.push({
      id: 'ins-top-cat',
      type: 'info',
      title: `${top.category} is your highest spend category`,
      description: `${top.category} accounts for ₹${top.amount.toLocaleString('en-IN')} (${top.percentage}% of your monthly expenses).`,
    });
  }

  // 2. Subscriptions cost insight
  const recTotals = calculateRecurringTotals(recurring);
  insights.push({
    id: 'ins-subscriptions',
    type: 'info',
    title: 'Recurring Commitments',
    description: `Subscriptions & active bills account for ₹${recTotals.monthlyTotal.toLocaleString('en-IN')} across ${recTotals.activeCount} commitments this month.`,
  });

  // 3. Category comparison / Food spending
  const foodTxs = expenseTxs.filter((tx) => tx.category === 'Food');
  const foodTotal = foodTxs.reduce((s, tx) => s + tx.amount, 0);
  const prevTxs = getPreviousPeriodTransactions(transactions, '30D');
  const prevFoodTxs = prevTxs.filter((tx) => tx.category === 'Food' && tx.type === 'expense');
  const prevFoodTotal = prevFoodTxs.reduce((s, tx) => s + tx.amount, 0) || 12000;
  const foodDiffPercent = prevFoodTotal > 0 ? Math.round(((foodTotal - prevFoodTotal) / prevFoodTotal) * 100) : 0;

  if (foodDiffPercent < 0) {
    insights.push({
      id: 'ins-food',
      type: 'positive',
      title: 'Food spending is well disciplined',
      description: `Food spending is ${Math.abs(foodDiffPercent)}% lower than last month's pace with ₹${foodTotal.toLocaleString('en-IN')} spent so far.`,
    });
  } else {
    insights.push({
      id: 'ins-food',
      type: 'warning',
      title: 'Food spending trend',
      description: `Food spending is currently at ₹${foodTotal.toLocaleString('en-IN')} across ${foodTxs.length} dining and delivery transactions.`,
    });
  }

  // 4. Budget health insight
  const budgetUsage = calculateBudgetUsage(budgets, transactions, '30D');
  const overBudgetItem = budgetUsage.find((b) => b.status === 'danger');
  const warningBudgetItem = budgetUsage.find((b) => b.status === 'warning');

  if (overBudgetItem) {
    insights.push({
      id: 'ins-budget-alert',
      type: 'warning',
      title: `Over budget in ${overBudgetItem.category}`,
      description: `You have reached ${overBudgetItem.percentage}% of your ₹${overBudgetItem.limit.toLocaleString('en-IN')} limit for ${overBudgetItem.category}.`,
    });
  } else if (warningBudgetItem) {
    insights.push({
      id: 'ins-budget-alert',
      type: 'warning',
      title: `Approaching limit in ${warningBudgetItem.category}`,
      description: `You have used ${warningBudgetItem.percentage}% of your ₹${warningBudgetItem.limit.toLocaleString('en-IN')} limit for ${warningBudgetItem.category}.`,
    });
  } else {
    insights.push({
      id: 'ins-budget-health',
      type: 'positive',
      title: 'All active budgets are healthy',
      description: 'Your expenses remain well within allocated targets across all tracking categories.',
    });
  }

  // 5. Savings rate insight
  const summary = calculateFinancialSummary(transactions, '30D');
  if (summary.savingsRate >= 40) {
    insights.push({
      id: 'ins-savings',
      type: 'positive',
      title: `Strong savings rate of ${summary.savingsRate}%`,
      description: `You are saving ₹${(summary.income - summary.expenses).toLocaleString('en-IN')} from your current monthly income, outpacing standard benchmarks.`,
    });
  }

  return insights;
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const cleanAmount = Math.round(amount);
  if (currency === 'INR') {
    return `₹${cleanAmount.toLocaleString('en-IN')}`;
  }
  if (currency === 'USD') {
    return `$${cleanAmount.toLocaleString('en-US')}`;
  }
  if (currency === 'EUR') {
    return `€${cleanAmount.toLocaleString('de-DE')}`;
  }
  if (currency === 'GBP') {
    return `£${cleanAmount.toLocaleString('en-GB')}`;
  }
  return `₹${cleanAmount.toLocaleString('en-IN')}`;
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      return `${months[monthIndex]} ${day}, ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
