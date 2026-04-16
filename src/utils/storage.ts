import type { AppState, UserAccount } from '../types';
import { defaultAppState } from './defaults';

// ── Kullanıcı hesapları ─────────────────────────────────────────────────────
const USERS_KEY       = 'kfu_users';
const CURRENT_USER_KEY = 'kfu_current_user_id';

export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserAccount[]) : [];
  } catch { return []; }
}

export function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserId(id: string): void {
  localStorage.setItem(CURRENT_USER_KEY, id);
}

export function clearCurrentUserId(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ── Kullanıcıya özel uygulama verisi ────────────────────────────────────────
function userDataKey(userId: string) {
  return `kfu_data_${userId}`;
}

export function loadUserState(userId: string): AppState {
  try {
    const raw = localStorage.getItem(userDataKey(userId));
    if (!raw) return getEmptyUserState('', '');
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...getEmptyUserState('', ''),
      ...parsed,
      categories:       parsed.categories?.length       ? parsed.categories       : defaultAppState.categories,
      incomeCategories: parsed.incomeCategories?.length ? parsed.incomeCategories : defaultAppState.incomeCategories,
      gamification:     parsed.gamification     ?? getEmptyUserState('','').gamification,
      goals:            parsed.goals            ?? [],
      creditInstallments: parsed.creditInstallments ?? [],
    };
  } catch { return getEmptyUserState('', ''); }
}

export function saveUserState(userId: string, state: AppState): void {
  try {
    localStorage.setItem(userDataKey(userId), JSON.stringify(state));
  } catch (e) {
    console.error('State save failed:', e);
  }
}

// ── Yeni kullanıcı için örnek verili state ───────────────────────────────────
export function getSampleUserState(name: string, surname: string): AppState {
  return {
    ...defaultAppState,
    profile: { name, surname, onboardingDone: false },
    gamification: {
      xp: 0,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      earnedBadgeIds: [],
      totalExpensesAdded: 0,
      totalIncomesAdded: 0,
    },
  };
}

// ── Yeni kullanıcı için boş state ───────────────────────────────────────────
export function getEmptyUserState(name: string, surname: string): AppState {
  return {
    cards: [],
    categories:       defaultAppState.categories,
    incomeCategories: defaultAppState.incomeCategories,
    expenses: [],
    incomes:  [],
    profile:  { name, surname },
    gamification: {
      xp: 0,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      earnedBadgeIds: [],
      totalExpensesAdded: 0,
      totalIncomesAdded: 0,
    },
    goals: [],
    creditInstallments: [],
  };
}

// ── JSON export / import (geriye dönük uyumluluk) ───────────────────────────
export function exportToJSON(state: AppState): void {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `kfu_veriler_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target?.result as string) as AppState;
        resolve(state);
      } catch { reject(new Error('Geçersiz JSON dosyası')); }
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsText(file);
  });
}

// ── Hesap silme ──────────────────────────────────────────────────────────────
export function deleteUserAccount(userId: string): void {
  localStorage.removeItem(userDataKey(userId));
  saveUsers(getUsers().filter(u => u.id !== userId));
}

// ── Tüm KFU verisini sıfırla ─────────────────────────────────────────────────
export function clearAllKFUData(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('kfu_'));
  keys.forEach(k => localStorage.removeItem(k));
}

// ── Eski tek kullanıcılı veriyi migrasyona hazır tut ─────────────────────────
export function clearLegacyData(): void {
  localStorage.removeItem('kfu_app_data');
  localStorage.removeItem('kfu_auth');
  localStorage.removeItem('kfu_password');
}
