import React from 'react';
import {
  Home, ArrowLeftRight, CreditCard, Receipt,
  BarChart2, Settings, User, X, Target, Flame, LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Page } from '../../types';
import { getLevelInfo, getLevelProgress } from '../../utils/gamification';

interface NavItem { id: Page; label: string; icon: React.ReactNode }

const navItems: NavItem[] = [
  { id: 'home',      label: 'Anasayfa',          icon: <Home size={20} /> },
  { id: 'movements', label: 'Hareketler',         icon: <ArrowLeftRight size={20} /> },
  { id: 'cards',     label: 'Kartlarım',           icon: <CreditCard size={20} /> },
  { id: 'expenses',  label: 'Geçmiş Harcamalar', icon: <Receipt size={20} /> },
  { id: 'reports',   label: 'Raporlar',           icon: <BarChart2 size={20} /> },
  { id: 'goals',     label: 'Hedefler',           icon: <Target size={20} /> },
];

export function Sidebar() {
  const { currentPage, setPage, sidebarOpen, setSidebarOpen, state, logout } = useApp();
  const { xp, streak } = state.gamification;
  const levelInfo = getLevelInfo(xp);
  const progress = getLevelProgress(xp);
  const nextXP = levelInfo.maxXP + 1;

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col bg-[#355e3b] text-white transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/3.png" alt="KFU" className="w-12 h-12 rounded-xl object-cover shrink-0" />
            <p className="text-xs text-white/70 leading-snug">Kişisel Finans<br />Uygulamanız</p>
          </div>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`sidebar-link w-full text-left ${currentPage === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}

          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider px-3 mt-4 mb-2">Hesap</p>
          <button onClick={() => setPage('profile')} className={`sidebar-link w-full text-left ${currentPage === 'profile' ? 'active' : ''}`}>
            <User size={20} /><span className="text-sm font-medium">Profil</span>
          </button>
          <button onClick={() => setPage('settings')} className={`sidebar-link w-full text-left ${currentPage === 'settings' ? 'active' : ''}`}>
            <Settings size={20} /><span className="text-sm font-medium">Ayarlar</span>
          </button>
        </nav>

        {/* Gamification panel */}
        <div className="border-t border-white/10 p-4 space-y-3">
          <div
            className="rounded-xl p-3 cursor-pointer"
            style={{ background: `${levelInfo.color}18`, border: `1px solid ${levelInfo.color}40` }}
            onClick={() => setPage('profile')}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{levelInfo.icon}</span>
                <div>
                  <p className="text-xs font-bold text-white leading-none">Seviye {levelInfo.level}</p>
                  <p className="text-xs leading-none mt-0.5" style={{ color: levelInfo.color }}>{levelInfo.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-orange-500/20 rounded-lg px-2 py-1">
                <Flame size={12} className="text-orange-400" />
                <span className="text-xs font-bold text-orange-300">{streak} gün</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">{xp} XP</span>
                <span className="text-white/35">{levelInfo.level < 5 ? `${nextXP} XP` : 'MAX'}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: levelInfo.color }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            {state.profile.photo
              ? <img src={state.profile.photo} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              : <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
                  {(state.profile.name[0] ?? 'K').toUpperCase()}
                </div>
            }
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{state.profile.name} {state.profile.surname}</p>
              <p className="text-xs text-white/50">{state.gamification.earnedBadgeIds.length} rozet</p>
            </div>
            <button
              onClick={logout}
              title="Çıkış Yap"
              className="p-1.5 rounded-lg text-white/50 hover:text-red-300 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
