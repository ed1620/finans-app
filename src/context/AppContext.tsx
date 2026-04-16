import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  useRef,
} from 'react';
import type {
  AppState, Card, Category, Expense, Income,
  IncomeCategory, Profile, Page, Goal, CreditInstallment, UserAccount,
} from '../types';
import {
  loadUserState, saveUserState,
  getEmptyUserState, getSampleUserState,
  getUsers, saveUsers,
  getCurrentUserId, setCurrentUserId, clearCurrentUserId,
  clearLegacyData, deleteUserAccount,
} from '../utils/storage';
import { generateId } from '../utils/helpers';
import { checkBadges, updateStreak, XP } from '../utils/gamification';

// ─── Action types ──────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'UPDATE_INCOME'; payload: Income }
  | { type: 'DELETE_INCOME'; payload: string }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_INCOME_CATEGORY'; payload: IncomeCategory }
  | { type: 'UPDATE_INCOME_CATEGORY'; payload: IncomeCategory }
  | { type: 'DELETE_INCOME_CATEGORY'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_INSTALLMENT'; payload: CreditInstallment }
  | { type: 'UPDATE_INSTALLMENT'; payload: CreditInstallment }
  | { type: 'DELETE_INSTALLMENT'; payload: string }
  | { type: 'PAY_INSTALLMENT'; payload: string }
  | { type: 'AWARD_XP'; payload: number }
  | { type: 'EARN_BADGE'; payload: string }
  | { type: 'BULK_IMPORT'; payload: { expenses: Expense[]; incomes: Income[] } };

// ─── Gamification helpers ──────────────────────────────────────────────────

function applyGamification(state: AppState, baseXP: number): AppState {
  const updatedGami = updateStreak({
    ...state.gamification,
    xp: state.gamification.xp + baseXP,
    totalExpensesAdded: state.gamification.totalExpensesAdded,
    totalIncomesAdded: state.gamification.totalIncomesAdded,
  });
  const intermediate = { ...state, gamification: updatedGami };
  const { newBadgeIds, bonusXP } = checkBadges(intermediate);
  if (newBadgeIds.length === 0) return intermediate;
  return {
    ...intermediate,
    gamification: {
      ...updatedGami,
      xp: updatedGami.xp + bonusXP,
      earnedBadgeIds: [...updatedGami.earnedBadgeIds, ...newBadgeIds],
    },
  };
}

// ─── Reducer ───────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'ADD_EXPENSE': {
      const s = {
        ...state,
        expenses: [action.payload, ...state.expenses],
        gamification: { ...state.gamification, totalExpensesAdded: state.gamification.totalExpensesAdded + 1 },
      };
      return applyGamification(s, XP.ADD_EXPENSE);
    }
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };

    case 'ADD_INCOME': {
      const s = {
        ...state,
        incomes: [action.payload, ...state.incomes],
        gamification: { ...state.gamification, totalIncomesAdded: state.gamification.totalIncomesAdded + 1 },
      };
      return applyGamification(s, XP.ADD_INCOME);
    }
    case 'UPDATE_INCOME':
      return { ...state, incomes: state.incomes.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INCOME':
      return { ...state, incomes: state.incomes.filter(i => i.id !== action.payload) };

    case 'ADD_CARD':
      return applyGamification({ ...state, cards: [...state.cards, action.payload] }, 0);
    case 'UPDATE_CARD':
      return { ...state, cards: state.cards.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CARD':
      return { ...state, cards: state.cards.filter(c => c.id !== action.payload) };

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };

    case 'ADD_INCOME_CATEGORY':
      return { ...state, incomeCategories: [...state.incomeCategories, action.payload] };
    case 'UPDATE_INCOME_CATEGORY':
      return { ...state, incomeCategories: state.incomeCategories.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_INCOME_CATEGORY':
      return { ...state, incomeCategories: state.incomeCategories.filter(c => c.id !== action.payload) };

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };

    case 'ADD_INSTALLMENT':
      return { ...state, creditInstallments: [...state.creditInstallments, action.payload] };
    case 'UPDATE_INSTALLMENT':
      return { ...state, creditInstallments: state.creditInstallments.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INSTALLMENT':
      return { ...state, creditInstallments: state.creditInstallments.filter(i => i.id !== action.payload) };
    case 'PAY_INSTALLMENT': {
      const inst = state.creditInstallments.find(i => i.id === action.payload);
      if (!inst) return state;
      const updated = { ...inst, paidInstallments: Math.min(inst.paidInstallments + 1, inst.installmentCount) };
      return { ...state, creditInstallments: state.creditInstallments.map(i => i.id === action.payload ? updated : i) };
    }

    case 'AWARD_XP':
      return { ...state, gamification: { ...state.gamification, xp: state.gamification.xp + action.payload } };

    case 'EARN_BADGE': {
      if (state.gamification.earnedBadgeIds.includes(action.payload)) return state;
      return { ...state, gamification: { ...state.gamification, earnedBadgeIds: [...state.gamification.earnedBadgeIds, action.payload] } };
    }

    case 'BULK_IMPORT': {
      const s = {
        ...state,
        expenses: [...action.payload.expenses, ...state.expenses],
        incomes: [...action.payload.incomes, ...state.incomes],
        gamification: {
          ...state.gamification,
          xp: state.gamification.xp + XP.IMPORT_EXCEL + (action.payload.expenses.length * 5) + (action.payload.incomes.length * 5),
          totalExpensesAdded: state.gamification.totalExpensesAdded + action.payload.expenses.length,
          totalIncomesAdded: state.gamification.totalIncomesAdded + action.payload.incomes.length,
        },
      };
      const withBadge = s.gamification.earnedBadgeIds.includes('excel_import')
        ? s
        : { ...s, gamification: { ...s.gamification, xp: s.gamification.xp + 30, earnedBadgeIds: [...s.gamification.earnedBadgeIds, 'excel_import'] } };
      const { newBadgeIds, bonusXP } = checkBadges(withBadge);
      if (newBadgeIds.length === 0) return withBadge;
      return {
        ...withBadge,
        gamification: {
          ...withBadge.gamification,
          xp: withBadge.gamification.xp + bonusXP,
          earnedBadgeIds: [...withBadge.gamification.earnedBadgeIds, ...newBadgeIds],
        },
      };
    }

    default:
      return state;
  }
}

// ─── Auth result ────────────────────────────────────────────────────────────

interface AuthResult {
  success: boolean;
  error?: string;
}

// ─── Context ────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentPage: Page;
  setPage: (page: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  newBadges: string[];
  clearNewBadges: () => void;
  // Auth
  currentUser: UserAccount | null;
  isLoggedIn: boolean;
  login:          (email: string, password: string) => AuthResult;
  register:       (name: string, surname: string, email: string, password: string) => AuthResult;
  logout:         () => void;
  deleteAccount:  () => void;
  changePassword: (currentPw: string, newPw: string) => AuthResult;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// Boş başlangıç state (reducer için başlangıç değeri)
const INITIAL_STATE = getEmptyUserState('', '');

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Reducer — başlangıçta oturum açık kullanıcının verisini yükle (senkron)
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const uid = getCurrentUserId();
    return uid ? loadUserState(uid) : INITIAL_STATE;
  });

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const prevBadgesRef = useRef<string[]>(state.gamification.earnedBadgeIds);

  // Giriş yapan kullanıcıyı yükle
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const uid = getCurrentUserId();
    if (!uid) return null;
    return getUsers().find(u => u.id === uid) ?? null;
  });

  // Aktif kullanıcı ID'sini ref'te tut (save effect için race condition yok)
  const currentUserIdRef = useRef<string | null>(currentUser?.id ?? null);
  useEffect(() => { currentUserIdRef.current = currentUser?.id ?? null; }, [currentUser]);

  // Veriyi kaydet (sadece oturum açıksa)
  useEffect(() => {
    if (currentUserIdRef.current) {
      saveUserState(currentUserIdRef.current, state);
    }
  }, [state]);

  // Yeni rozet tespiti
  useEffect(() => {
    const prev = prevBadgesRef.current;
    const curr = state.gamification.earnedBadgeIds;
    const fresh = curr.filter(id => !prev.includes(id));
    if (fresh.length > 0) setNewBadges(fresh);
    prevBadgesRef.current = curr;
  }, [state.gamification.earnedBadgeIds]);

  const setPage = useCallback((page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  }, []);

  const clearNewBadges = useCallback(() => setNewBadges([]), []);

  // ── Giriş ────────────────────────────────────────────────────────────────
  const login = useCallback((email: string, password: string): AuthResult => {
    const users = getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user)               return { success: false, error: 'Bu e-posta adresiyle kayıtlı hesap bulunamadı.' };
    if (user.password !== password) return { success: false, error: 'Şifre hatalı. Lütfen tekrar deneyin.' };

    setCurrentUserId(user.id);
    currentUserIdRef.current = user.id;
    const userState = loadUserState(user.id);
    dispatch({ type: 'SET_STATE', payload: userState });
    setCurrentUser(user);
    setCurrentPage('home');
    return { success: true };
  }, []);

  // ── Kayıt ────────────────────────────────────────────────────────────────
  const register = useCallback((name: string, surname: string, email: string, password: string): AuthResult => {
    const trimmedEmail = email.toLowerCase().trim();
    const users = getUsers();

    if (users.some(u => u.email.toLowerCase() === trimmedEmail))
      return { success: false, error: 'Bu e-posta adresi zaten kullanılıyor.' };

    const newUser: UserAccount = {
      id:        generateId(),
      name:      name.trim(),
      surname:   surname.trim(),
      email:     trimmedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);

    const newState = getSampleUserState(newUser.name, newUser.surname);
    saveUserState(newUser.id, newState);

    setCurrentUserId(newUser.id);
    currentUserIdRef.current = newUser.id;
    dispatch({ type: 'SET_STATE', payload: newState });
    setCurrentUser(newUser);
    setCurrentPage('home');
    clearLegacyData();
    return { success: true };
  }, []);

  // ── Onboarding tamamla ───────────────────────────────────────────────────
  const completeOnboarding = useCallback(() => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { onboardingDone: true } });
  }, []);

  // ── Çıkış ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearCurrentUserId();
    currentUserIdRef.current = null;
    setCurrentUser(null);
    dispatch({ type: 'SET_STATE', payload: INITIAL_STATE });
    setCurrentPage('home');
  }, []);

  // ── Hesap sil ────────────────────────────────────────────────────────────
  const deleteAccount = useCallback(() => {
    const uid = currentUserIdRef.current;
    if (uid) deleteUserAccount(uid);
    clearCurrentUserId();
    currentUserIdRef.current = null;
    setCurrentUser(null);
    dispatch({ type: 'SET_STATE', payload: INITIAL_STATE });
    setCurrentPage('home');
  }, []);

  // ── Şifre değiştir ───────────────────────────────────────────────────────
  const changePassword = useCallback((currentPw: string, newPw: string): AuthResult => {
    const users = getUsers();
    const user  = users.find(u => u.id === currentUserIdRef.current);
    if (!user)                    return { success: false, error: 'Kullanıcı bulunamadı.' };
    if (user.password !== currentPw) return { success: false, error: 'Mevcut şifre hatalı.' };
    if (newPw.length < 4)         return { success: false, error: 'Yeni şifre en az 4 karakter olmalı.' };
    saveUsers(users.map(u => u.id === user.id ? { ...u, password: newPw } : u));
    return { success: true };
  }, []);

  return (
    <AppContext.Provider value={{
      state, dispatch,
      currentPage, setPage,
      sidebarOpen, setSidebarOpen,
      newBadges, clearNewBadges,
      currentUser,
      isLoggedIn: currentUser !== null,
      login, register, logout, deleteAccount, changePassword, completeOnboarding,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
