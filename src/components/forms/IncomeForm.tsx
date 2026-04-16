import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Income } from '../../types';
import { generateId } from '../../utils/helpers';

interface Props {
  onClose: () => void;
  income?: Income;
}

export function IncomeForm({ onClose, income }: Props) {
  const { state, dispatch } = useApp();

  const [form, setForm] = useState({
    accountId: income?.accountId ?? (state.cards[0]?.id ?? ''),
    amount: income?.amount?.toString() ?? '',
    categoryId: income?.categoryId ?? (state.incomeCategories[0]?.id ?? ''),
    sender: income?.sender ?? '',
    description: income?.description ?? '',
    date: income?.date
      ? new Date(income.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.accountId || !form.amount || !form.sender) return;

    const payload: Income = {
      id: income?.id ?? generateId(),
      accountId: form.accountId,
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      sender: form.sender,
      description: form.description || undefined,
      date: new Date(form.date).toISOString(),
    };

    dispatch(income ? { type: 'UPDATE_INCOME', payload } : { type: 'ADD_INCOME', payload });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Account */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Hesap</label>
        <select
          className="input-field"
          value={form.accountId}
          onChange={(e) => set('accountId', e.target.value)}
          required
        >
          {state.cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — *{c.lastFour}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tutar (₺)</label>
        <input
          className="input-field"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
        <select
          className="input-field"
          value={form.categoryId}
          onChange={(e) => set('categoryId', e.target.value)}
          required
        >
          {state.incomeCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sender */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Gönderen</label>
        <input
          className="input-field"
          type="text"
          placeholder="örn. İşveren, KYK..."
          value={form.sender}
          onChange={(e) => set('sender', e.target.value)}
          required
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tarih</label>
        <input
          className="input-field"
          type="datetime-local"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Açıklama <span className="text-slate-400">(isteğe bağlı)</span>
        </label>
        <textarea
          className="input-field resize-none"
          rows={2}
          placeholder="İsteğe bağlı açıklama..."
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          İptal
        </button>
        <button type="submit" className="btn-primary flex-1">
          {income ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    </form>
  );
}
