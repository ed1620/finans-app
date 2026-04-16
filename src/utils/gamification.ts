import type { AppState, Gamification } from '../types';

// ─── Levels ────────────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Başlangıç', minXP: 0,    maxXP: 199,      icon: '🌱', color: '#10b981' },
  { level: 2, name: 'Takipçi',   minXP: 200,  maxXP: 499,      icon: '⭐', color: '#3b82f6' },
  { level: 3, name: 'Birikimci', minXP: 500,  maxXP: 999,      icon: '💡', color: '#8b5cf6' },
  { level: 4, name: 'Tasarruf Uzmanı', minXP: 1000, maxXP: 1999, icon: '🏅', color: '#f59e0b' },
  { level: 5, name: 'Finans Gurusu', minXP: 2000, maxXP: 99999, icon: '🏆', color: '#ef4444' },
];

export function getLevelInfo(xp: number): LevelInfo {
  return [...LEVELS].reverse().find(l => xp >= l.minXP) ?? LEVELS[0];
}

export function getLevelProgress(xp: number): number {
  const level = getLevelInfo(xp);
  const range = level.maxXP - level.minXP + 1;
  const progress = xp - level.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}

// ─── XP rewards ────────────────────────────────────────────────────────────

export const XP = {
  ADD_EXPENSE: 10,
  ADD_INCOME: 15,
  DAILY_STREAK: 20,
  STREAK_7_BONUS: 100,
  STREAK_30_BONUS: 500,
  COMPLETE_GOAL: 75,
  IMPORT_EXCEL: 30,
};

// ─── Badges ────────────────────────────────────────────────────────────────

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

export const ALL_BADGES: BadgeDef[] = [
  { id: 'first_expense',   name: 'İlk Adım',            description: 'İlk harcamanı kaydettin!',        icon: '🎯', xpReward: 25  },
  { id: 'first_income',    name: 'Gelir Takipçisi',      description: 'İlk gelirini kaydettin!',         icon: '💰', xpReward: 25  },
  { id: 'streak_3',        name: 'Tutarlı',              description: '3 gün art arda takip yaptın',     icon: '🔥', xpReward: 50  },
  { id: 'streak_7',        name: 'Haftalık Şampiyon',    description: '7 gün art arda takip yaptın',     icon: '⚡', xpReward: 100 },
  { id: 'streak_30',       name: 'Aylık Efsane',         description: '30 gün art arda takip yaptın',    icon: '🏆', xpReward: 500 },
  { id: 'no_regret_7',     name: 'Pişmanlık Yok',        description: 'Son 7 günde pişmanlık harcaması yok', icon: '😊', xpReward: 75 },
  { id: 'excel_import',    name: 'Excel Ustası',         description: 'Excel dosyasından veri yükledin', icon: '📊', xpReward: 30  },
  { id: 'goal_complete',   name: 'Hedefine Ulaştın',     description: 'Bir hedefe ulaştın!',             icon: '🎪', xpReward: 75  },
  { id: 'savings_50',      name: 'Tasarruf Kahramanı',   description: 'Bu ay %50+ tasarruf oranı!',      icon: '💎', xpReward: 100 },
  { id: 'expenses_10',     name: 'Harcama Dedektifi',    description: '10 harcama kaydın var',           icon: '🔍', xpReward: 40  },
  { id: 'expenses_50',     name: 'Çok Çalışkan',         description: '50 harcama kaydın var',           icon: '💪', xpReward: 100 },
  { id: 'card_collector',  name: 'Kart Koleksiyoncusu',  description: '3 veya daha fazla kartın var',    icon: '💳', xpReward: 30  },
];

// ─── Streak logic ──────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function updateStreak(gami: Gamification): Gamification {
  const today = todayStr();
  const yesterday = yesterdayStr();
  const last = gami.lastActiveDate;

  if (last === today) return gami; // already active today

  let newStreak: number;
  let bonusXP = XP.DAILY_STREAK;

  if (last === yesterday) {
    newStreak = gami.streak + 1;
    if (newStreak === 7)  bonusXP += XP.STREAK_7_BONUS;
    if (newStreak === 30) bonusXP += XP.STREAK_30_BONUS;
  } else {
    newStreak = 1;
  }

  return {
    ...gami,
    streak: newStreak,
    longestStreak: Math.max(gami.longestStreak, newStreak),
    lastActiveDate: today,
    xp: gami.xp + bonusXP,
  };
}

// ─── Badge checking ────────────────────────────────────────────────────────

export function checkBadges(state: AppState): { newBadgeIds: string[]; bonusXP: number } {
  const earned = new Set(state.gamification.earnedBadgeIds);
  const newIds: string[] = [];

  function tryEarn(id: string, condition: boolean) {
    if (condition && !earned.has(id)) {
      newIds.push(id);
      earned.add(id);
    }
  }

  const g = state.gamification;
  const expCount = state.expenses.length;
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Monthly savings rate
  const monthExpenses = state.expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const monthIncomes = state.incomes.filter(i => {
    const d = new Date(i.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const totalInc = monthIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExp = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0;

  // Check no-regret last 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentExpenses = state.expenses.filter(e => new Date(e.date) >= sevenDaysAgo);
  const hasRecentRegret = recentExpenses.some(e => e.regret);

  tryEarn('first_expense',   expCount >= 1);
  tryEarn('first_income',    state.incomes.length >= 1);
  tryEarn('streak_3',        g.streak >= 3);
  tryEarn('streak_7',        g.streak >= 7);
  tryEarn('streak_30',       g.streak >= 30);
  tryEarn('no_regret_7',     recentExpenses.length > 0 && !hasRecentRegret);
  tryEarn('savings_50',      savingsRate >= 50 && totalInc > 0);
  tryEarn('expenses_10',     expCount >= 10);
  tryEarn('expenses_50',     expCount >= 50);
  tryEarn('card_collector',  state.cards.length >= 3);
  tryEarn('goal_complete',   state.goals.some(g => g.isCompleted));

  const bonusXP = newIds.reduce((sum, id) => {
    const badge = ALL_BADGES.find(b => b.id === id);
    return sum + (badge?.xpReward ?? 0);
  }, 0);

  return { newBadgeIds: newIds, bonusXP };
}

// ─── Daily tasks ───────────────────────────────────────────────────────────

export interface DailyTaskDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const DAILY_TASKS: DailyTaskDef[] = [
  { id: 'dt_expense', title: 'Harcama Kaydet',  description: 'Bugün en az 1 harcama ekle',   icon: '💸' },
  { id: 'dt_income',  title: 'Gelir Gir',        description: 'Bugün bir gelir kaydet',        icon: '💰' },
  { id: 'dt_streak',  title: 'Seriyi Koru',      description: 'Uygulamayı bugün kullan',       icon: '🔥' },
  { id: 'dt_goal',    title: 'Hedef Belirle',    description: 'En az bir tasarruf hedefi koy', icon: '🎯' },
];

export function getDailyProgress(state: AppState): {
  tasks: (DailyTaskDef & { done: boolean })[];
  completedCount: number;
} {
  const today = new Date().toISOString().slice(0, 10);
  const tasks: (DailyTaskDef & { done: boolean })[] = [
    { ...DAILY_TASKS[0], done: state.expenses.some(e => e.date.startsWith(today)) },
    { ...DAILY_TASKS[1], done: state.incomes.some(i => i.date.startsWith(today)) },
    { ...DAILY_TASKS[2], done: state.gamification.lastActiveDate === today },
    { ...DAILY_TASKS[3], done: state.goals.length > 0 },
  ];
  return { tasks, completedCount: tasks.filter(t => t.done).length };
}

// ─── Daily tips ────────────────────────────────────────────────────────────

export const DAILY_TIPS = [
  { text: '50/30/20 kuralını uygula: %50 ihtiyaçlar, %30 istekler, %20 tasarruf.', tag: 'TASARRUF' },
  { text: 'Acil durum fonu oluştur. En az 3 aylık giderinizi karşılayacak birikim hedefi koy.', tag: 'TASARRUF' },
  { text: 'Küçük harcamalar toplanınca büyük tutara ulaşır. Günlük takip yap!', tag: 'TAKİP' },
  { text: 'Aboneliklerini gözden geçir. Kullanmadığın servisleri iptal et.', tag: 'İPUCU' },
  { text: 'Her maaşı aldığında önce tasarrufa ayır, kalanını harca.', tag: 'TASARRUF' },
  { text: 'Pişmanlık harcamalarını takip etmek, alışveriş alışkanlıklarını değiştirmene yardımcı olur.', tag: 'ALIŞKANLIK' },
  { text: 'Hedef belirlemek tasarruf motivasyonunu artırır. Bir hedef koy!', tag: 'HEdef' },
  { text: 'Kredi kartı borcunu her ay tam öde. Taksit faizleri birikirken dikkat et.', tag: 'KREDİ' },
  { text: 'Fatura günlerini takvime ekle. Gecikme faizinden kaçın.', tag: 'FATURA' },
  { text: 'Market alışverişine listeyle çık. Plansız harcamaları azaltır.', tag: 'ALIŞVERİŞ' },
];

export function getDailyTip() {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_TIPS[day % DAILY_TIPS.length];
}
