import { useState } from 'react';
import { CreditCard, AlertCircle, ChevronRight, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  formatDateShort,
  getMonthExpenses,
  getMonthIncomes,
  getTotalAmount,
} from '../utils/helpers';
import { DailyTasksCard } from '../components/common/DailyTasksCard';

/* ── Stat kartı ── */
function StatCard({
  label,
  value,
  meta,
  color,
  bg,
  icon,
}: {
  label: string;
  value: string;
  meta: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div>
        <p
          className="font-bold leading-none"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '26px',
            color,
          }}
        >
          {value}
        </p>
        <p className="text-xs text-slate-400 mt-1.5">{meta}</p>
      </div>
    </div>
  );
}

/* ── Bölüm başlığı ── */
function SectionHeader({ title, onAll }: { title: string; onAll: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
      <button
        onClick={onAll}
        className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
      >
        Tümünü Gör <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* ── Ana bileşen ── */
export function HomePage() {
  const { state, setPage } = useApp();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  const monthExpenses = getMonthExpenses(state.expenses, year, month);
  const monthIncomes  = getMonthIncomes(state.incomes, year, month);
  const totalExpense  = getTotalAmount(monthExpenses);
  const totalIncome   = getTotalAmount(monthIncomes);
  const balance       = totalIncome - totalExpense;
  const savingsRate   = totalIncome > 0
    ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100)
    : 0;

  const recentExpenses = [...state.expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── 4 İstatistik Kartı ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Aylık Gelir"
          value={formatCurrency(totalIncome)}
          meta="Bu ay"
          color="#16a34a"
          bg="#dcfce7"
          icon={<TrendingUp size={17} />}
        />
        <StatCard
          label="Aylık Harcama"
          value={formatCurrency(totalExpense)}
          meta="Bu ay"
          color="#dc2626"
          bg="#fee2e2"
          icon={<TrendingDown size={17} />}
        />
        <StatCard
          label="Kalan Bakiye"
          value={formatCurrency(balance)}
          meta="Hesaplanan"
          color={balance >= 0 ? '#2563eb' : '#d97706'}
          bg={balance >= 0 ? '#dbeafe' : '#fef3c7'}
          icon={<Wallet size={17} />}
        />
        <StatCard
          label="Tasarruf Oranı"
          value={`%${savingsRate.toFixed(0)}`}
          meta="Bu ay"
          color="#7c3aed"
          bg="#ede9fe"
          icon={<PiggyBank size={17} />}
        />
      </div>

      {/* ── Günlük Görevler ── */}
      <DailyTasksCard />

      {/* ── 2 Sütun: Kartlar + Son Harcamalar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* ── Sol: Kartlarım (Yelpaze) ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionHeader title="Kartlarım" onAll={() => setPage('cards')} />

          {state.cards.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-slate-400">
              <CreditCard size={32} className="mb-2" />
              <p className="text-sm">Henüz kart yok</p>
            </div>
          ) : (
            <div>
              {/* ── Yelpaze (fan) alanı ── */}
              <div
                style={{
                  position: 'relative',
                  height: '290px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                }}
              >
                {state.cards.map((card, i) => {
                  const total     = state.cards.length;
                  const angleStep = Math.min(12, 55 / Math.max(total - 1, 1));
                  const rotation  = (i - (total - 1) / 2) * angleStep;
                  const xOffset   = (i - (total - 1) / 2) * 24;
                  const isActive  = selectedCardId === card.id;

                  return (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardId(isActive ? null : card.id)}
                      style={{
                        position: 'absolute',
                        width: '210px',
                        height: '130px',
                        borderRadius: '18px',
                        left: '50%',
                        marginLeft: '-105px',
                        bottom: '65px',
                        transformOrigin: 'bottom center',
                        transform: isActive
                          ? 'rotate(0deg) translateY(-70px) scale(1.08)'
                          : `rotate(${rotation}deg) translateX(${xOffset}px)`,
                        zIndex: isActive ? 100 : i + 1,
                        transition: 'all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        background: card.image
                          ? `url(${card.image}) center/cover`
                          : `linear-gradient(135deg, ${card.color}ee, ${card.color}77)`,
                        boxShadow: isActive
                          ? '0 18px 40px rgba(0,0,0,0.22)'
                          : '0 4px 14px rgba(0,0,0,0.16)',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textAlign: 'left',
                        color: 'white',
                        padding: '14px',
                        border: 'none',
                        outline: 'none',
                      }}
                    >
                      {/* Dekoratif daireler */}
                      <div
                        style={{
                          position: 'absolute',
                          right: '-16px',
                          top: '-16px',
                          width: '90px',
                          height: '90px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.10)',
                          pointerEvents: 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          right: '-4px',
                          bottom: '-22px',
                          width: '74px',
                          height: '74px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.10)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Kart içeriği */}
                      <div
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        {/* Üst: banka adı */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CreditCard size={11} style={{ opacity: 0.8 }} />
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              opacity: 0.9,
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              maxWidth: '140px',
                            }}
                          >
                            {card.bank}
                          </span>
                        </div>

                        {/* Alt: numara + bakiye + isim */}
                        <div>
                          <p
                            style={{
                              fontSize: '10px',
                              opacity: 0.65,
                              marginBottom: '2px',
                              fontFamily: 'monospace',
                            }}
                          >
                            •••• •••• •••• {card.lastFour}
                          </p>
                          <p
                            style={{
                              fontFamily: "'Outfit', sans-serif",
                              fontWeight: 700,
                              fontSize: '15px',
                              lineHeight: 1,
                            }}
                          >
                            {formatCurrency(card.balance)}
                          </p>
                          <p
                            style={{
                              fontSize: '9px',
                              opacity: 0.75,
                              marginTop: '3px',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {card.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── Alttaki kart listesi ── */}
              <div className="space-y-1 border-t border-slate-100 pt-3">
                {state.cards.map((card) => {
                  const isActive = selectedCardId === card.id;
                  return (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardId(isActive ? null : card.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                        isActive ? 'bg-blue-50 shadow-sm' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-sm"
                        style={{ background: card.color }}
                      />
                      <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                        {card.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        •••• {card.lastFour}
                      </span>
                      <span
                        className="text-sm font-semibold text-slate-800 shrink-0"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {formatCurrency(card.balance)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Sağ: Son 7 Harcama ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <SectionHeader title="Son 7 Harcama" onAll={() => setPage('expenses')} />

          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-slate-400">
              <AlertCircle size={32} className="mb-2" />
              <p className="text-sm">Henüz harcama yok</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentExpenses.map((expense) => {
                const category = state.categories.find((c) => c.id === expense.categoryId);
                const card     = state.cards.find((c) => c.id === expense.cardId);

                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {/* Kategori ikonu */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                      style={{ background: (category?.color ?? '#3b82f6') + '18' }}
                    >
                      {category?.icon ?? '💼'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {expense.location}
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {category && (
                          <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                            {category.name}
                          </span>
                        )}
                        {card && (
                          <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                            {card.name}
                          </span>
                        )}
                        <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                          {formatDateShort(expense.date)}
                        </span>
                      </div>
                      {expense.regret && (
                        <p className="text-[10px] text-orange-500 mt-0.5">😔 Pişmanlık</p>
                      )}
                    </div>

                    {/* Tutar */}
                    <p
                      className="text-sm font-bold text-red-500 shrink-0"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      -{formatCurrency(expense.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
