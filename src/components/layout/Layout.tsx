import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, TrendingDown, TrendingUp, Search, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Modal } from '../common/Modal';
import { BadgeToast } from '../common/BadgeToast';
import { ExpenseForm } from '../forms/ExpenseForm';
import { IncomeForm } from '../forms/IncomeForm';

const pageTitles: Record<string, string> = {
  home: 'Anasayfa', movements: 'Hareketler', cards: 'Kartlarım',
  expenses: 'Geçmiş Harcamalar', reports: 'Raporlar', goals: 'Hedefler',
  settings: 'Ayarlar', profile: 'Profil',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentPage, setSidebarOpen, newBadges, clearNewBadges, logout, state } = useApp();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [xpAnim, setXpAnim] = useState<{ amount: number; key: number } | null>(null);
  const prevXPRef = useRef(state.gamification.xp);

  useEffect(() => {
    const delta = state.gamification.xp - prevXPRef.current;
    if (delta > 0) {
      setXpAnim({ amount: delta, key: Date.now() });
      const t = setTimeout(() => setXpAnim(null), 2200);
      return () => clearTimeout(t);
    }
    prevXPRef.current = state.gamification.xp;
  }, [state.gamification.xp]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-4 lg:px-6 py-3.5 flex items-center gap-4 shrink-0 z-10">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* XP kazanım animasyonu */}
          {xpAnim && (
            <span
              key={xpAnim.key}
              className="xp-float-anim absolute left-12 top-2 text-xs font-bold text-[#355e3b] pointer-events-none z-50 lg:hidden"
            >
              +{xpAnim.amount} XP ⚡
            </span>
          )}

          <h2 className="text-lg font-semibold text-slate-800 shrink-0 lg:hidden">
            {pageTitles[currentPage] ?? ''}
          </h2>

          {/* Search bar */}
          <div className="hidden lg:flex flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Harcama, kategori ara..."
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700">
              <Bell size={20} />
            </button>
            <button
              onClick={logout}
              className="lg:hidden p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut size={18} />
            </button>
            <button
              onClick={() => setShowIncomeModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-medium px-3.5 py-2 rounded-xl transition-colors text-sm"
            >
              <TrendingUp size={15} />
              + Gelir
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2 rounded-xl transition-colors text-sm"
            >
              <TrendingDown size={15} />
              <span className="hidden sm:inline">+ Harcama</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </header>

        {/* Page title for desktop */}
        <div className="hidden lg:flex items-center px-6 pt-5 pb-1 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{pageTitles[currentPage] ?? ''}</h2>
        </div>

        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
          {children}
        </main>
      </div>

      <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Harcama Ekle">
        <ExpenseForm onClose={() => setShowExpenseModal(false)} />
      </Modal>
      <Modal isOpen={showIncomeModal} onClose={() => setShowIncomeModal(false)} title="Gelir Ekle">
        <IncomeForm onClose={() => setShowIncomeModal(false)} />
      </Modal>

      <BadgeToast badgeIds={newBadges} onDone={clearNewBadges} />
    </div>
  );
}
