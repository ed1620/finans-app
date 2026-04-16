import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Expense } from '../../types';
import { generateId } from '../../utils/helpers';

interface Props {
  onClose: () => void;
  expense?: Expense;
}

export function ExpenseForm({ onClose, expense }: Props) {
  const { state, dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    cardId: expense?.cardId ?? (state.cards[0]?.id ?? ''),
    categoryId: expense?.categoryId ?? (state.categories[0]?.id ?? ''),
    subcategoryId: expense?.subcategoryId ?? '',
    location: expense?.location ?? '',
    amount: expense?.amount?.toString() ?? '',
    description: expense?.description ?? '',
    regret: expense?.regret ?? false,
    date: expense?.date
      ? new Date(expense.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    receiptImage: expense?.receiptImage ?? '',
  });

  const selectedCategory = state.categories.find((c) => c.id === form.categoryId);

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => set('receiptImage', e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cardId || !form.categoryId || !form.location || !form.amount) return;

    const payload: Expense = {
      id: expense?.id ?? generateId(),
      cardId: form.cardId,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || undefined,
      location: form.location,
      amount: parseFloat(form.amount),
      description: form.description || undefined,
      regret: form.regret,
      date: new Date(form.date).toISOString(),
      receiptImage: form.receiptImage || undefined,
    };

    dispatch(expense ? { type: 'UPDATE_EXPENSE', payload } : { type: 'ADD_EXPENSE', payload });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Kart</label>
        <select
          className="input-field"
          value={form.cardId}
          onChange={(e) => set('cardId', e.target.value)}
          required
        >
          {state.cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — *{c.lastFour}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
          <select
            className="input-field"
            value={form.categoryId}
            onChange={(e) => { set('categoryId', e.target.value); set('subcategoryId', ''); }}
            required
          >
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Alt Kategori</label>
          <select
            className="input-field"
            value={form.subcategoryId}
            onChange={(e) => set('subcategoryId', e.target.value)}
          >
            <option value="">Seçiniz</option>
            {selectedCategory?.subcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location & Amount */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Harcama Yeri</label>
          <input
            className="input-field"
            type="text"
            placeholder="örn. Migros"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            required
          />
        </div>
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

      {/* Regret */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="regret"
          className="w-4 h-4 rounded text-blue-600"
          checked={form.regret}
          onChange={(e) => set('regret', e.target.checked)}
        />
        <label htmlFor="regret" className="text-sm text-slate-700">
          Pişmanlık durumu (Bu harcamadan pişman mısınız?)
        </label>
      </div>

      {/* Receipt Image */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Fiş Fotoğrafı</label>
        {form.receiptImage ? (
          <div className="relative">
            <img
              src={form.receiptImage}
              alt="Fiş"
              className="w-full max-h-40 object-contain rounded-xl border border-slate-200"
            />
            <button
              type="button"
              onClick={() => set('receiptImage', '')}
              className="absolute top-2 right-2 bg-white rounded-lg p-1.5 shadow text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-3 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
            >
              <Camera size={18} />
              Fotoğraf Çek
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-3 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
            >
              <Upload size={18} />
              Dosya Seç
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          İptal
        </button>
        <button type="submit" className="btn-primary flex-1">
          {expense ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    </form>
  );
}
