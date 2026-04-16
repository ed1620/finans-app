import { useState } from 'react';
import { TrendingDown, TrendingUp, Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/helpers';

type TabType = 'all' | 'expenses' | 'incomes';

export function MovementsPage() {
  const { state } = useApp();
  const [tab, setTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  type Movement =
    | { kind: 'expense'; id: string; amount: number; date: string; label: string; sub: string; categoryColor: string; categoryIcon: string }
    | { kind: 'income'; id: string; amount: number; date: string; label: string; sub: string; categoryColor: string; categoryIcon: string };

  const movements: Movement[] = [
    ...state.expenses.map((e) => {
      const cat = state.categories.find((c) => c.id === e.categoryId);
      const card = state.cards.find((c) => c.id === e.cardId);
      return {
        kind: 'expense' as const,
        id: e.id,
        amount: e.amount,
        date: e.date,
        label: e.location,
        sub: `${cat?.name ?? ''} • ${card?.name ?? ''}`,
        categoryColor: cat?.color ?? '#94a3b8',
        categoryIcon: cat?.icon ?? '💼',
      };
    }),
    ...state.incomes.map((i) => {
      const cat = state.incomeCategories.find((c) => c.id === i.categoryId);
      const account = state.cards.find((c) => c.id === i.accountId);
      return {
        kind: 'income' as const,
        id: i.id,
        amount: i.amount,
        date: i.date,
        label: i.sender,
        sub: `${cat?.name ?? ''} • ${account?.name ?? ''}`,
        categoryColor: cat?.color ?? '#94a3b8',
        categoryIcon: cat?.icon ?? '💰',
      };
    }),
  ];

  const filtered = movements
    .filter((m) => {
      if (tab === 'expenses') return m.kind === 'expense';
      if (tab === 'incomes') return m.kind === 'income';
      return true;
    })
    .filter((m) =>
      !search || m.label.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return sortOrder === 'desc' ? diff : -diff;
    });

  const totalIncome = state.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = state.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Toplam Gelir</p>
            <p className="font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <TrendingDown size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Toplam Harcama</p>
            <p className="font-bold text-red-500">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden">
          {(['all', 'expenses', 'incomes'] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {t === 'all' ? 'Tümü' : t === 'expenses' ? 'Harcamalar' : 'Gelirler'}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-40 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Filter size={15} />
          {sortOrder === 'desc' ? 'En Yeni' : 'En Eski'}
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-400">
            <p className="text-sm">Hareket bulunamadı</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {filtered.map((m) => (
              <li key={`${m.kind}-${m.id}`} className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: m.categoryColor + '20' }}
                >
                  {m.categoryIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{m.label}</p>
                  <p className="text-xs text-slate-400 truncate">{m.sub} • {formatDate(m.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`font-semibold text-sm ${m.kind === 'income' ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {m.kind === 'income' ? '+' : '-'}{formatCurrency(m.amount)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
