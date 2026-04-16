import { useState } from 'react';
import {
  Search, Filter, Edit2, Trash2, Image, AlertCircle,
  ChevronDown, Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Modal } from '../components/common/Modal';
import { ExpenseForm } from '../components/forms/ExpenseForm';

export function ExpensesPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCard, setFilterCard] = useState('');
  const [filterRegret, setFilterRegret] = useState<'all' | 'yes' | 'no'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [editExpense, setEditExpense] = useState<Expense | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);

  const filtered = state.expenses
    .filter((e) => {
      if (search && !e.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategory && e.categoryId !== filterCategory) return false;
      if (filterCard && e.cardId !== filterCard) return false;
      if (filterRegret === 'yes' && !e.regret) return false;
      if (filterRegret === 'no' && e.regret) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sortOrder === 'desc' ? diff : -diff;
      }
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    });

  function deleteExpense(id: string) {
    if (confirm('Bu harcamayı silmek istediğinizden emin misiniz?')) {
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    }
  }

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {filtered.length} harcama • Toplam: <strong className="text-red-500">{formatCurrency(totalFiltered)}</strong>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Harcama Ekle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter size={16} /> Filtrele
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9 text-sm"
              placeholder="Yer ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input-field text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Tüm Kategoriler</option>
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>

          <select
            className="input-field text-sm"
            value={filterCard}
            onChange={(e) => setFilterCard(e.target.value)}
          >
            <option value="">Tüm Kartlar</option>
            {state.cards.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            className="input-field text-sm"
            value={filterRegret}
            onChange={(e) => setFilterRegret(e.target.value as 'all' | 'yes' | 'no')}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="yes">😔 Pişmanlık Var</option>
            <option value="no">Pişmanlık Yok</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-500">Sırala:</span>
          {['date', 'amount'].map((s) => (
            <button
              key={s}
              onClick={() => {
                if (sortBy === s) setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                else { setSortBy(s as 'date' | 'amount'); setSortOrder('desc'); }
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 ${sortBy === s ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
            >
              {s === 'date' ? 'Tarih' : 'Tutar'}
              <ChevronDown size={12} className={sortBy === s && sortOrder === 'asc' ? 'rotate-180' : ''} />
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-slate-400 gap-2">
            <AlertCircle size={32} />
            <p className="text-sm">Harcama bulunamadı</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {filtered.map((expense) => {
              const category = state.categories.find((c) => c.id === expense.categoryId);
              const subcat = category?.subcategories.find((s) => s.id === expense.subcategoryId);
              const card = state.cards.find((c) => c.id === expense.cardId);

              return (
                <li key={expense.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: category?.color + '20' }}
                  >
                    {category?.icon ?? '💼'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-800 text-sm">{expense.location}</p>
                      {expense.regret && (
                        <span className="badge bg-orange-100 text-orange-600 text-xs">😔 Pişmanlık</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {category?.name}
                      {subcat ? ` › ${subcat.name}` : ''} • {card?.name ?? ''} • {formatDate(expense.date)}
                    </p>
                    {expense.description && (
                      <p className="text-xs text-slate-500 italic mt-0.5 truncate">{expense.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-red-500 text-sm">-{formatCurrency(expense.amount)}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {expense.receiptImage && (
                      <button
                        onClick={() => setViewReceipt(expense.receiptImage!)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                      >
                        <Image size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => { setEditExpense(expense); setShowModal(true); }}
                      className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditExpense(undefined); }}
        title="Harcamayı Düzenle"
      >
        <ExpenseForm
          expense={editExpense}
          onClose={() => { setShowModal(false); setEditExpense(undefined); }}
        />
      </Modal>

      {/* Add modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Harcama Ekle">
        <ExpenseForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Receipt view modal */}
      <Modal isOpen={!!viewReceipt} onClose={() => setViewReceipt(null)} title="Fiş Fotoğrafı">
        {viewReceipt && (
          <img src={viewReceipt} alt="Fiş" className="w-full rounded-xl max-h-96 object-contain" />
        )}
      </Modal>
    </div>
  );
}
