import React, { useState } from 'react';
import { Plus, CreditCard, Edit2, Trash2, Upload, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Card } from '../types';
import { formatCurrency, generateId } from '../utils/helpers';
import { Modal } from '../components/common/Modal';

const CARD_COLORS = [
  '#1B5E20', '#1565C0', '#4A148C', '#E65100',
  '#880E4F', '#006064', '#37474F', '#BF360C',
  '#1a1f36', '#0d47a1',
];

const CARD_TYPES = [
  { value: 'debit',   label: 'Banka Kartı (Debit)' },
  { value: 'credit',  label: 'Kredi Kartı' },
  { value: 'prepaid', label: 'Ön Ödemeli' },
  { value: 'kyk',     label: 'KYK Kart' },
];

/* ── Kart ekleme/düzenleme formu ── */
function CardFormModal({ card, onClose }: { card?: Card; onClose: () => void }) {
  const { dispatch } = useApp();
  const imgRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name:          card?.name          ?? '',
    bank:          card?.bank          ?? '',
    type:          card?.type          ?? 'debit',
    lastFour:      card?.lastFour      ?? '',
    balance:       card?.balance?.toString() ?? '0',
    color:         card?.color         ?? CARD_COLORS[0],
    image:         card?.image         ?? '',
    isActive:      card?.isActive      ?? true,
    cutoffDay:     card?.cutoffDay?.toString()    ?? '',
    dueDayOffset:  card?.dueDayOffset?.toString() ?? '',
  });

  function set(k: string, v: string | boolean) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => set('image', e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Card = {
      id:           card?.id ?? generateId(),
      name:         form.name,
      bank:         form.bank,
      type:         form.type as Card['type'],
      lastFour:     form.lastFour,
      balance:      parseFloat(form.balance),
      color:        form.color,
      image:        form.image || undefined,
      isActive:     form.isActive,
      cutoffDay:    form.type === 'credit' && form.cutoffDay    ? parseInt(form.cutoffDay)    : undefined,
      dueDayOffset: form.type === 'credit' && form.dueDayOffset ? parseInt(form.dueDayOffset) : undefined,
    };
    dispatch(card ? { type: 'UPDATE_CARD', payload } : { type: 'ADD_CARD', payload });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Kart Adı</label>
          <input className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="örn. Ziraat Bankkart" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Banka / Kurum</label>
          <input className="input-field" value={form.bank} onChange={(e) => set('bank', e.target.value)} required placeholder="örn. Ziraat Bankası" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Kart Türü</label>
          <select className="input-field" value={form.type} onChange={(e) => set('type', e.target.value)}>
            {CARD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Son 4 Hane</label>
          <input className="input-field" value={form.lastFour} onChange={(e) => set('lastFour', e.target.value.slice(0, 4))} maxLength={4} placeholder="1234" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Bakiye (₺)</label>
        <input className="input-field" type="number" step="0.01" value={form.balance} onChange={(e) => set('balance', e.target.value)} />
      </div>

      {/* Kredi kartı özel alanları */}
      {form.type === 'credit' && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <div>
            <label className="block text-xs font-semibold text-amber-700 mb-1.5">Kesim Günü (1–28)</label>
            <input
              className="input-field text-sm"
              type="number"
              min={1}
              max={28}
              value={form.cutoffDay}
              onChange={(e) => set('cutoffDay', e.target.value)}
              placeholder="örn. 25"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-700 mb-1.5">Son Ödeme Offseti (gün)</label>
            <input
              className="input-field text-sm"
              type="number"
              min={1}
              max={30}
              value={form.dueDayOffset}
              onChange={(e) => set('dueDayOffset', e.target.value)}
              placeholder="örn. 10"
            />
          </div>
          {form.cutoffDay && form.dueDayOffset && (
            <div className="col-span-2 text-xs text-amber-600">
              📅 Kesim: her ayın {form.cutoffDay}. günü &nbsp;·&nbsp; Son ödeme: kesimden {form.dueDayOffset} gün sonra
            </div>
          )}
        </div>
      )}

      {/* Renk seçici */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Kart Rengi</label>
        <div className="flex gap-2 flex-wrap">
          {CARD_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-blue-500' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => set('color', c)}
            />
          ))}
        </div>
      </div>

      {/* Özel görsel */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Özel Görsel (isteğe bağlı)</label>
        {form.image ? (
          <div className="relative">
            <img src={form.image} alt="Kart" className="w-full h-28 object-cover rounded-xl border border-slate-200" />
            <button type="button" onClick={() => set('image', '')} className="absolute top-2 right-2 bg-white rounded-lg p-1 shadow text-red-500">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imgRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-3 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
          >
            <Upload size={18} /> Görsel Yükle
          </button>
        )}
        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
      </div>

      {/* Önizleme */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Önizleme</label>
        <div
          className="w-full max-w-xs mx-auto h-36 rounded-2xl p-4 flex flex-col justify-between text-white"
          style={{ background: form.image ? `url(${form.image}) center/cover` : form.color }}
        >
          <div className="flex items-center gap-2">
            <CreditCard size={18} />
            <span className="text-xs font-medium opacity-90">{form.bank || 'Banka'}</span>
          </div>
          <div>
            <p className="text-xs opacity-75">•••• {form.lastFour || '****'}</p>
            <p className="font-bold">{formatCurrency(parseFloat(form.balance) || 0)}</p>
            <p className="text-xs opacity-75">{form.name || 'Kart Adı'}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">İptal</button>
        <button type="submit" className="btn-primary flex-1">{card ? 'Güncelle' : 'Kart Ekle'}</button>
      </div>
    </form>
  );
}

/* ── Ana sayfa ── */
export function CardsPage() {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal]   = useState(false);
  const [editCard, setEditCard]     = useState<Card | undefined>();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  function deleteCard(id: string) {
    if (confirm('Bu kartı silmek istediğinizden emin misiniz?')) {
      dispatch({ type: 'DELETE_CARD', payload: id });
      if (selectedCardId === id) setSelectedCardId(null);
    }
  }

  const totalBalance = state.cards.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Üst stat */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-sm mb-1">Toplam Bakiye</p>
          <p className="text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-blue-200 text-sm mt-1">{state.cards.length} kart</p>
        </div>
        <CreditCard size={48} className="text-blue-300 opacity-60" />
      </div>

      {state.cards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center text-slate-400">
          <CreditCard size={40} className="mb-3" />
          <p className="text-base font-medium mb-1">Henüz kart eklenmedi</p>
          <p className="text-sm">Aşağıdan ilk kartınızı ekleyebilirsiniz.</p>
        </div>
      ) : (
        <>
          {/* ── Yelpaze görünümü (her zaman açık) ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Kartlarım</h3>
              <span className="text-xs text-slate-400">{state.cards.length} kart · kartına tıkla</span>
            </div>

            {/* Fan alanı */}
            <div
              style={{
                position: 'relative',
                height: '290px',
                overflow: 'hidden',
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
                      width: '220px',
                      height: '135px',
                      borderRadius: '18px',
                      left: '50%',
                      marginLeft: '-110px',
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
                        ? '0 20px 40px rgba(0,0,0,0.22)'
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
                    <div style={{ position:'absolute', right:'-16px', top:'-16px', width:'90px', height:'90px', borderRadius:'50%', background:'rgba(255,255,255,0.10)', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', right:'-4px', bottom:'-22px', width:'74px', height:'74px', borderRadius:'50%', background:'rgba(255,255,255,0.10)', pointerEvents:'none' }} />

                    <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <CreditCard size={11} style={{ opacity:0.8 }} />
                        <span style={{ fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', opacity:0.9, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:'150px' }}>
                          {card.bank}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize:'10px', opacity:0.65, marginBottom:'2px', fontFamily:'monospace' }}>
                          •••• •••• •••• {card.lastFour}
                        </p>
                        <p style={{ fontFamily:"'Outfit', sans-serif", fontWeight:700, fontSize:'16px', lineHeight:1 }}>
                          {formatCurrency(card.balance)}
                        </p>
                        <p style={{ fontSize:'9px', opacity:0.75, marginTop:'3px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                          {card.name}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Kart listesi (altta) */}
            <div className="space-y-1 border-t border-slate-100 pt-3">
              {state.cards.map((card) => {
                const isActive = selectedCardId === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(isActive ? null : card.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${isActive ? 'bg-blue-50 shadow-sm' : 'hover:bg-slate-50'}`}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-sm" style={{ background: card.color }} />
                    <span className="text-sm font-medium text-slate-700 flex-1 truncate">{card.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">•••• {card.lastFour}</span>
                    <span className="text-sm font-semibold text-slate-800 shrink-0" style={{ fontFamily:"'Outfit', sans-serif" }}>
                      {formatCurrency(card.balance)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Kart detay listesi (düzenle/sil) ── */}
          <div className="space-y-3">
            {state.cards.map((card) => (
              <div key={card.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  {/* Mini kart görseli */}
                  <div
                    className="w-16 h-10 rounded-lg shrink-0 flex items-center justify-center text-white"
                    style={{ background: card.image ? `url(${card.image}) center/cover` : card.color }}
                  >
                    <CreditCard size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{card.name}</p>
                    <p className="text-xs text-slate-400">
                      {card.bank} • *{card.lastFour} • {CARD_TYPES.find((t) => t.value === card.type)?.label}
                    </p>
                    {card.type === 'credit' && card.cutoffDay && (
                      <p className="text-[10px] text-amber-500 mt-0.5">
                        ✂️ Kesim: {card.cutoffDay}. gün
                        {card.dueDayOffset ? ` · Son ödeme: +${card.dueDayOffset} gün` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold ${card.balance >= 0 ? 'text-slate-800' : 'text-red-500'}`} style={{ fontFamily:"'Outfit', sans-serif" }}>
                      {formatCurrency(card.balance)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => { setEditCard(card); setShowModal(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => deleteCard(card.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Kart ekle butonu */}
      <button
        onClick={() => { setEditCard(undefined); setShowModal(true); }}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl py-4 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium"
      >
        <Plus size={20} />
        Yeni Kart Ekle
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditCard(undefined); }}
        title={editCard ? 'Kartı Düzenle' : 'Yeni Kart Ekle'}
        size="lg"
      >
        <CardFormModal card={editCard} onClose={() => { setShowModal(false); setEditCard(undefined); }} />
      </Modal>
    </div>
  );
}
