import type { Expense, Income } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getMonthExpenses(expenses: Expense[], year: number, month: number): Expense[] {
  return expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getMonthIncomes(incomes: Income[], year: number, month: number): Income[] {
  return incomes.filter((i) => {
    const d = new Date(i.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getTotalAmount(items: { amount: number }[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function getWeekExpenses(expenses: Expense[]): Expense[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return expenses.filter((e) => new Date(e.date) >= weekAgo);
}

export function getDayExpenses(expenses: Expense[], date: Date): Expense[] {
  return expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  });
}

export function groupExpensesByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.categoryId] = (acc[e.categoryId] ?? 0) + e.amount;
    return acc;
  }, {});
}

export function getMostExpensiveExpense(expenses: Expense[]): Expense | null {
  if (!expenses.length) return null;
  return expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0]);
}

export function getMostFrequentLocation(expenses: Expense[]): string | null {
  if (!expenses.length) return null;
  const counts: Record<string, number> = {};
  expenses.forEach((e) => {
    counts[e.location] = (counts[e.location] ?? 0) + 1;
  });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];
}
