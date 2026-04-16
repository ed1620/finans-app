import { useState } from 'react';
import { Target, Plus, Trash2, CheckCircle2, TrendingUp, ShoppingBag, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, generateId } from '../utils/helpers';
import type { Goal } from '../types';

function GoalForm({ onClose }: { onClose: () => void }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    name: '',
    icon: '🎯',
    type: 'saving' as Goal['type'],
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const goal: Goal = {
      id: generateId(),
      name: form.name,
      icon: form.icon,
      type: form.type,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount),
      deadline: form.deadline || undefined,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_GOAL', payload: goal });
    onClose();
  }

  const ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💰', '🛒', '🏋️'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Hedef Adı</label>
          <input
            className="input-field"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required
            placeholder="örn. Tatil Fonu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">İkon</label>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm(p => ({ ...p, icon }))}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-colors ${form.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-slate-100 hover:bg-slate-200'}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tür</label>
          <select
            className="input-field"
            value={form.type}
            onChange={e => setForm(p => ({ ...p, type: e.target.value as Goal['type'] }))}
          >
            <option value="saving">Birikim Hedefi</option>
            <option value="spending_limit">Harcama Limiti</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Hedef Tutar (₺)</label>
          <input
            className="input-field"
            type="number"
            min="1"
            value={form.targetAmount}
            onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))}
            required
            placeholder="5000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mevcut Tutar (₺)</label>
          <input
            className="input-field"
            type="number"
            min="0"
            value={form.currentAmount}
            onChange={e => setForm(p => ({ ...p, currentAmount: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Son Tarih (isteğe bağlı)</label>
        <input
          className="input-field"
          type="date"
          value={form.deadline}
          onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">İptal</button>
        <button type="submit" className="btn-primary flex-1">Hedef Ekle</button>
      </div>
    </form>
  );
}

export function GoalsPage() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);

  const savingGoals  = state.goals.filter(g => g.type === 'saving');
  const limitGoals   = state.goals.filter(g => g.type === 'spending_limit');
  const completedCnt = state.goals.filter(g => g.isCompleted).length;

  function deleteGoal(id: string) {
    if (confirm('Bu hedefi silmek istiyor musunuz?')) {
      dispatch({ type: 'DELETE_GOAL', payload: id });
    }
  }

  function toggleComplete(goal: Goal) {
    dispatch({
      type: 'UPDATE_GOAL',
      payload: { ...goal, isCompleted: !goal.isCompleted },
    });
  }

  function GoalCard({ goal }: { goal: Goal }) {
    const progress = Math.min(100, goal.targetAmount > 0
      ? (goal.currentAmount / goal.targetAmount) * 100
      : 0);
    const isLimit = goal.type === 'spending_limit';
    const overLimit = isLimit && goal.currentAmount > goal.targetAmount;

    return (
      <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${goal.isCompleted ? 'border-green-200 opacity-75' : 'border-slate-100'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${goal.isCompleted ? 'bg-green-50' : 'bg-slate-50'}`}>
              {goal.isCompleted ? '✅' : goal.icon}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{goal.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isLimit ? '🚫 Harcama Limiti' : '💰 Birikim Hedefi'}
                {goal.deadline && ` • ${new Date(goal.deadline).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => toggleComplete(goal)}
              className={`p-1.5 rounded-lg transition-colors ${goal.isCompleted ? 'text-green-500 bg-green-50' : 'text-slate-400 hover:text-green-500 hover:bg-green-50'}`}
              title="Tamamlandı olarak işaretle"
            >
              <CheckCircle2 size={16} />
            </button>
            <button
              onClick={() => deleteGoal(goal.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* İlerleme çubuğu */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className={`font-semibold ${overLimit ? 'text-red-500' : 'text-slate-700'}`}>
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="text-slate-400">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                goal.isCompleted ? 'bg-green-500' :
                overLimit ? 'bg-red-500' :
                progress >= 80 ? 'bg-emerald-500' :
                progress >= 50 ? 'bg-blue-500' : 'bg-slate-400'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{progress.toFixed(0)}% tamamlandı</span>
            <span>{formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))} kaldı</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Özet */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-slate-800">{state.goals.length}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Toplam Hedef</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-green-600">{completedCnt}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Tamamlanan</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-blue-600">{state.goals.length - completedCnt}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Devam Eden</p>
        </div>
      </div>

      {/* Yeni hedef butonu */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Yeni Hedef
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800">Yeni Hedef Ekle</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <GoalForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Birikim hedefleri */}
      {savingGoals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-green-500" />
            <h3 className="font-semibold text-slate-700 text-sm">Birikim Hedefleri</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savingGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* Harcama limitleri */}
      {limitGoals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag size={16} className="text-orange-500" />
            <h3 className="font-semibold text-slate-700 text-sm">Harcama Limitleri</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {limitGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* Boş durum */}
      {state.goals.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center py-16 text-slate-400">
          <Target size={40} className="mb-3" />
          <p className="font-medium text-slate-600 mb-1">Henüz hedef yok</p>
          <p className="text-sm">Finansal hedefinizi ekleyerek ilerlemeyi takip edin.</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-5 flex items-center gap-2"
          >
            <Plus size={15} /> İlk Hedefini Ekle
          </button>
        </div>
      )}
    </div>
  );
}
