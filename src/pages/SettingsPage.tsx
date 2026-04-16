import { useState, useRef } from 'react';
import {
  Plus, Trash2, Edit2, Download, Upload, FileJson,
  Table, ChevronDown, ChevronRight, Check, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Category, IncomeCategory, SubCategory } from '../types';
import { generateId } from '../utils/helpers';
import { exportToJSON, importFromJSON, getEmptyUserState } from '../utils/storage';
import { exportToExcel } from '../utils/excel';

const ICONS = ['🍕', '🚌', '📚', '👕', '🎮', '💊', '📄', '💼', '🏠', '✈️', '🎁', '💻', '📱', '🏋️', '🛒', '🎓', '💰', '📈'];
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FF7675', '#74B9FF', '#A29BFE', '#00B894', '#FDCB6E'];

function InlineEdit({
  value,
  onSave,
  onCancel,
}: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState(value);
  return (
    <div className="flex items-center gap-2 flex-1">
      <input
        className="input-field text-sm flex-1"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter') onSave(val); if (e.key === 'Escape') onCancel(); }}
      />
      <button onClick={() => onSave(val)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
      <button onClick={onCancel} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={14} /></button>
    </div>
  );
}

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'incomeCategories' | 'data'>('categories');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingIncId, setEditingIncId] = useState<string | null>(null);
  const [newCatForm, setNewCatForm] = useState({ show: false, name: '', icon: '💼', color: '#94a3b8' });
  const [newIncForm, setNewIncForm] = useState({ show: false, name: '', icon: '💰', color: '#94a3b8' });
  const [newSubForm, setNewSubForm] = useState<Record<string, string>>({});

  // --- Category actions ---
  function addCategory() {
    if (!newCatForm.name.trim()) return;
    const cat: Category = {
      id: generateId(),
      name: newCatForm.name.trim(),
      icon: newCatForm.icon,
      color: newCatForm.color,
      subcategories: [],
    };
    dispatch({ type: 'ADD_CATEGORY', payload: cat });
    setNewCatForm({ show: false, name: '', icon: '💼', color: '#94a3b8' });
  }

  function updateCategoryName(id: string, name: string) {
    const cat = state.categories.find((c) => c.id === id);
    if (!cat) return;
    dispatch({ type: 'UPDATE_CATEGORY', payload: { ...cat, name } });
    setEditingCatId(null);
  }

  function deleteCategory(id: string) {
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
    }
  }

  function addSubcategory(catId: string) {
    const name = newSubForm[catId]?.trim();
    if (!name) return;
    const cat = state.categories.find((c) => c.id === catId);
    if (!cat) return;
    const sub: SubCategory = { id: generateId(), name };
    dispatch({ type: 'UPDATE_CATEGORY', payload: { ...cat, subcategories: [...cat.subcategories, sub] } });
    setNewSubForm((p) => ({ ...p, [catId]: '' }));
  }

  function deleteSubcategory(catId: string, subId: string) {
    const cat = state.categories.find((c) => c.id === catId);
    if (!cat) return;
    dispatch({ type: 'UPDATE_CATEGORY', payload: { ...cat, subcategories: cat.subcategories.filter((s) => s.id !== subId) } });
  }

  function updateSubcategoryName(catId: string, subId: string, name: string) {
    const cat = state.categories.find((c) => c.id === catId);
    if (!cat) return;
    dispatch({ type: 'UPDATE_CATEGORY', payload: { ...cat, subcategories: cat.subcategories.map((s) => s.id === subId ? { ...s, name } : s) } });
    setEditingSubId(null);
  }

  // --- Income category actions ---
  function addIncomeCategory() {
    if (!newIncForm.name.trim()) return;
    const cat: IncomeCategory = {
      id: generateId(),
      name: newIncForm.name.trim(),
      icon: newIncForm.icon,
      color: newIncForm.color,
    };
    dispatch({ type: 'ADD_INCOME_CATEGORY', payload: cat });
    setNewIncForm({ show: false, name: '', icon: '💰', color: '#94a3b8' });
  }

  function updateIncomeCategoryName(id: string, name: string) {
    const cat = state.incomeCategories.find((c) => c.id === id);
    if (!cat) return;
    dispatch({ type: 'UPDATE_INCOME_CATEGORY', payload: { ...cat, name } });
    setEditingIncId(null);
  }

  function deleteIncomeCategory(id: string) {
    if (confirm('Bu gelir kategorisini silmek istediğinizden emin misiniz?')) {
      dispatch({ type: 'DELETE_INCOME_CATEGORY', payload: id });
    }
  }

  // --- Data actions ---
  async function handleJSONImport(file: File) {
    try {
      const newState = await importFromJSON(file);
      if (confirm('Mevcut veriler silinecek ve yeni veriler yüklenecek. Onaylıyor musunuz?')) {
        dispatch({ type: 'SET_STATE', payload: newState });
        alert('Veriler başarıyla yüklendi!');
      }
    } catch {
      alert('JSON dosyası yüklenemedi.');
    }
  }

  const tabs = [
    { id: 'categories', label: 'Harcama Kategorileri' },
    { id: 'incomeCategories', label: 'Gelir Kategorileri' },
    { id: 'data', label: 'Veri Yönetimi' },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Tabs */}
      <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Expense Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-3">
          {state.categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: cat.color + '30' }}
                >
                  {cat.icon}
                </div>
                {editingCatId === cat.id ? (
                  <InlineEdit
                    value={cat.name}
                    onSave={(name) => updateCategoryName(cat.id, name)}
                    onCancel={() => setEditingCatId(null)}
                  />
                ) : (
                  <span className="flex-1 font-medium text-slate-800 text-sm">{cat.name}</span>
                )}
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    {expandedCat === cat.id ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>
                  <button
                    onClick={() => setEditingCatId(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCat === cat.id && (
                <div className="border-t border-slate-50 px-4 py-3 space-y-2 bg-slate-50/50">
                  <p className="text-xs text-slate-400 font-medium mb-2">Alt Kategoriler</p>
                  {cat.subcategories.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2 pl-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      {editingSubId === sub.id ? (
                        <InlineEdit
                          value={sub.name}
                          onSave={(name) => updateSubcategoryName(cat.id, sub.id, name)}
                          onCancel={() => setEditingSubId(null)}
                        />
                      ) : (
                        <>
                          <span className="flex-1 text-sm text-slate-700">{sub.name}</span>
                          <button onClick={() => setEditingSubId(sub.id)} className="p-1 text-slate-400 hover:text-blue-600"><Edit2 size={12} /></button>
                          <button onClick={() => deleteSubcategory(cat.id, sub.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                        </>
                      )}
                    </div>
                  ))}
                  {/* Add subcategory */}
                  <div className="flex gap-2 mt-2">
                    <input
                      className="input-field text-sm flex-1"
                      placeholder="Yeni alt kategori..."
                      value={newSubForm[cat.id] ?? ''}
                      onChange={(e) => setNewSubForm((p) => ({ ...p, [cat.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addSubcategory(cat.id)}
                    />
                    <button onClick={() => addSubcategory(cat.id)} className="btn-primary px-3 py-2 text-sm">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add category */}
          {newCatForm.show ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <p className="font-medium text-slate-800 text-sm">Yeni Kategori</p>
              <input
                className="input-field"
                placeholder="Kategori adı"
                value={newCatForm.name}
                onChange={(e) => setNewCatForm((p) => ({ ...p, name: e.target.value }))}
              />
              <div>
                <p className="text-xs text-slate-500 mb-1.5">İkon</p>
                <div className="flex gap-1.5 flex-wrap">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setNewCatForm((p) => ({ ...p, icon: ic }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${newCatForm.icon === ic ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-slate-100 hover:bg-slate-200'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Renk</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewCatForm((p) => ({ ...p, color: c }))}
                      className={`w-7 h-7 rounded-full ${newCatForm.color === c ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setNewCatForm({ show: false, name: '', icon: '💼', color: '#94a3b8' })} className="btn-secondary flex-1">İptal</button>
                <button onClick={addCategory} className="btn-primary flex-1">Ekle</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNewCatForm((p) => ({ ...p, show: true }))}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl py-3 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              <Plus size={18} /> Kategori Ekle
            </button>
          )}
        </div>
      )}

      {/* Income Categories */}
      {activeTab === 'incomeCategories' && (
        <div className="space-y-3">
          {state.incomeCategories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 px-4 py-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                style={{ backgroundColor: cat.color + '30' }}
              >
                {cat.icon}
              </div>
              {editingIncId === cat.id ? (
                <InlineEdit
                  value={cat.name}
                  onSave={(name) => updateIncomeCategoryName(cat.id, name)}
                  onCancel={() => setEditingIncId(null)}
                />
              ) : (
                <span className="flex-1 font-medium text-slate-800 text-sm">{cat.name}</span>
              )}
              <button onClick={() => setEditingIncId(cat.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600">
                <Edit2 size={15} />
              </button>
              <button onClick={() => deleteIncomeCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {newIncForm.show ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <p className="font-medium text-slate-800 text-sm">Yeni Gelir Kategorisi</p>
              <input
                className="input-field"
                placeholder="Kategori adı"
                value={newIncForm.name}
                onChange={(e) => setNewIncForm((p) => ({ ...p, name: e.target.value }))}
              />
              <div>
                <p className="text-xs text-slate-500 mb-1.5">İkon</p>
                <div className="flex gap-1.5 flex-wrap">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setNewIncForm((p) => ({ ...p, icon: ic }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${newIncForm.icon === ic ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-slate-100'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setNewIncForm({ show: false, name: '', icon: '💰', color: '#94a3b8' })} className="btn-secondary flex-1">İptal</button>
                <button onClick={addIncomeCategory} className="btn-primary flex-1">Ekle</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNewIncForm((p) => ({ ...p, show: true }))}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl py-3 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              <Plus size={18} /> Gelir Kategorisi Ekle
            </button>
          )}
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Veri Dışa Aktarma</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => exportToJSON(state)}
                className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileJson size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-800 text-sm">JSON İndir</p>
                  <p className="text-xs text-slate-400">Tüm veriler</p>
                </div>
                <Download size={16} className="ml-auto text-slate-400" />
              </button>
              <button
                onClick={() => exportToExcel(state)}
                className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Table size={20} className="text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-800 text-sm">Excel İndir</p>
                  <p className="text-xs text-slate-400">Harcamalar ve Gelirler</p>
                </div>
                <Download size={16} className="ml-auto text-slate-400" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Veri İçe Aktarma</h3>
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors text-slate-500"
            >
              <Upload size={20} />
              <div className="text-left">
                <p className="font-medium text-sm">JSON Dosyası Yükle</p>
                <p className="text-xs opacity-70">Daha önce dışa aktarılan dosyayı geri yükleyin</p>
              </div>
            </button>
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleJSONImport(e.target.files[0])}
            />
          </div>

          <div className="bg-red-50 rounded-2xl border border-red-100 p-5 space-y-3">
            <h3 className="font-semibold text-red-700">Tehlikeli Bölge</h3>
            <p className="text-xs text-red-500">Bu işlemler geri alınamaz.</p>

            <div className="flex items-center justify-between py-2 border-t border-red-100">
              <div>
                <p className="text-sm font-medium text-slate-700">Harcama &amp; Gelirleri Sil</p>
                <p className="text-xs text-slate-400">Kartlar ve kategoriler korunur</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Tüm harcama ve gelir verilerini silmek istediğinizden emin misiniz?')) {
                    dispatch({ type: 'SET_STATE', payload: { ...state, expenses: [], incomes: [] } });
                  }
                }}
                className="btn-danger text-xs px-3 py-1.5"
              >
                Sil
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-red-100">
              <div>
                <p className="text-sm font-medium text-slate-700">Tüm Verileri Sıfırla</p>
                <p className="text-xs text-slate-400">Kartlar, harcamalar, gelirler, hedefler — hepsi silinir</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Hesabındaki TÜM veriler silinecek (kartlar, harcamalar, gelirler, hedefler). Onaylıyor musunuz?')) {
                    const empty = getEmptyUserState(state.profile.name, state.profile.surname);
                    dispatch({ type: 'SET_STATE', payload: { ...empty, profile: state.profile } });
                  }
                }}
                className="btn-danger text-xs px-3 py-1.5"
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
