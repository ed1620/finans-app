import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Star, MapPin, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  getMonthExpenses,
  getMonthIncomes,
  getWeekExpenses,
  getDayExpenses,
  getTotalAmount,
  groupExpensesByCategory,
  getMostExpensiveExpense,
  getMostFrequentLocation,
  formatDateShort,
} from '../utils/helpers';

type Period = 'daily' | 'weekly' | 'monthly';

export function ReportsPage() {
  const { state } = useApp();
  const [period, setPeriod] = useState<Period>('monthly');

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Expenses by period
  const monthlyExpenses = getMonthExpenses(state.expenses, year, month);
  const weeklyExpenses = getWeekExpenses(state.expenses);
  const dailyExpenses = getDayExpenses(state.expenses, now);

  const periodExpenses =
    period === 'monthly' ? monthlyExpenses :
    period === 'weekly' ? weeklyExpenses :
    dailyExpenses;

  const monthlyIncomes = getMonthIncomes(state.incomes, year, month);
  const totalIncome = getTotalAmount(monthlyIncomes);
  const totalExpense = getTotalAmount(monthlyExpenses);
  const weeklyTotal = getTotalAmount(weeklyExpenses);
  const dailyTotal = getTotalAmount(dailyExpenses);

  // Category breakdown for pie chart
  const categoryTotals = groupExpensesByCategory(periodExpenses);
  const pieData = Object.entries(categoryTotals).map(([catId, amount]) => {
    const cat = state.categories.find((c) => c.id === catId);
    return { name: cat?.name ?? catId, value: amount, color: cat?.color ?? '#94a3b8', icon: cat?.icon ?? '💼' };
  }).sort((a, b) => b.value - a.value);

  // Daily spending for last 7 days bar chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const expenses = getDayExpenses(state.expenses, d);
    return {
      label: formatDateShort(d.toISOString()),
      total: getTotalAmount(expenses),
    };
  });

  // Monthly spending for last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    const exps = getMonthExpenses(state.expenses, d.getFullYear(), d.getMonth());
    return {
      label: d.toLocaleDateString('tr-TR', { month: 'short' }),
      total: getTotalAmount(exps),
    };
  });

  const mostExpensive = getMostExpensiveExpense(state.expenses);
  const mostExpensiveMonthly = getMostExpensiveExpense(monthlyExpenses);
  const topLocation = getMostFrequentLocation(periodExpenses);
  const topCategoryEntry = pieData[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Period tabs */}
      <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden w-fit">
        {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${period === p ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {p === 'daily' ? 'Günlük' : p === 'weekly' ? 'Haftalık' : 'Aylık'}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Günlük Harcama</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(dailyTotal)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Haftalık Harcama</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(weeklyTotal)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Aylık Harcama</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 mb-1">Aylık Gelir</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
      </div>

      {/* Highlight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {topCategoryEntry && (
          <div className="stat-card flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: topCategoryEntry.color + '20' }}>
              {topCategoryEntry.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">En Çok Harcanan Kategori</p>
              <p className="font-semibold text-slate-800 text-sm">{topCategoryEntry.name}</p>
              <p className="text-xs text-red-500 font-medium">{formatCurrency(topCategoryEntry.value)}</p>
            </div>
          </div>
        )}

        {topLocation && (
          <div className="stat-card flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">En Çok Harcama Yapılan Yer</p>
              <p className="font-semibold text-slate-800 text-sm">{topLocation}</p>
            </div>
          </div>
        )}

        {mostExpensiveMonthly && (
          <div className="stat-card flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Star size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">En Pahalı Harcama (Bu Ay)</p>
              <p className="font-semibold text-slate-800 text-sm truncate">{mostExpensiveMonthly.location}</p>
              <p className="text-xs text-red-500 font-medium">{formatCurrency(mostExpensiveMonthly.amount)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar chart - last 7 days */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Son 7 Günlük Harcama</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart - last 6 months */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Son 6 Aylık Harcama</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">
            Kategori Bazlı Harcama ({period === 'daily' ? 'Bugün' : period === 'weekly' ? 'Bu Hafta' : 'Bu Ay'})
          </h3>
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="w-full lg:w-80">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v))}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-slate-700 flex-1 truncate">{entry.icon} {entry.name}</span>
                  <span className="text-sm font-medium text-slate-800 shrink-0">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All-time most expensive */}
      {mostExpensive && (
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
            <Award size={22} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Tüm Zamanların En Pahalı Harcaması</p>
            <p className="font-bold text-slate-800">{mostExpensive.location}</p>
            <p className="text-sm text-red-500 font-medium">{formatCurrency(mostExpensive.amount)} — {formatDateShort(mostExpensive.date)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
