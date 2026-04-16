export interface Card {
  id: string;
  name: string;
  type: 'debit' | 'credit' | 'prepaid' | 'kyk';
  bank: string;
  lastFour: string;
  balance: number;
  color: string;
  image?: string;
  isActive: boolean;
  creditLimit?: number;
  cutoffDay?: number;    // Kesim günü (yalnızca kredi kartı)
  dueDayOffset?: number; // Son ödeme günü offseti (yalnızca kredi kartı)
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: SubCategory[];
}

export interface IncomeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  cardId: string;
  categoryId: string;
  subcategoryId?: string;
  location: string;
  amount: number;
  description?: string;
  regret: boolean;
  date: string;
  receiptImage?: string;
}

export interface Income {
  id: string;
  accountId: string;
  amount: number;
  categoryId: string;
  sender: string;
  description?: string;
  date: string;
}

export interface Profile {
  name: string;
  surname: string;
  photo?: string;
  onboardingDone?: boolean;
}

export interface Gamification {
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  earnedBadgeIds: string[];
  totalExpensesAdded: number;
  totalIncomesAdded: number;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  type: 'saving' | 'spending_limit';
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  categoryId?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface CreditInstallment {
  id: string;
  cardId: string;
  description: string;
  totalAmount: number;
  installmentCount: number;
  paidInstallments: number;
  monthlyAmount: number;
  startDate: string;
  expenseId?: string;       // İlişkili harcama ID'si
}

// Kredi kartı spesifik ayarlar (Card'a eklenir)
export interface CreditCardSettings {
  cutoffDay: number;    // Kesim günü (1–28)
  dueDayOffset: number; // Kesim'den kaç gün sonra son ödeme (örn. 10)
}

export interface AppState {
  cards: Card[];
  categories: Category[];
  incomeCategories: IncomeCategory[];
  expenses: Expense[];
  incomes: Income[];
  profile: Profile;
  gamification: Gamification;
  goals: Goal[];
  creditInstallments: CreditInstallment[];
}

export type Page =
  | 'home'
  | 'movements'
  | 'cards'
  | 'expenses'
  | 'reports'
  | 'goals'
  | 'settings'
  | 'profile';

export interface UserAccount {
  id: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  createdAt: string;
}
