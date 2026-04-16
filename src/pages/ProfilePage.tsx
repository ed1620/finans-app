import { useState, useRef } from 'react';
import {
  Camera, Edit2, Check, X, Star, Lock, Trash2,
  Mail, Calendar, Shield, Eye, EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMostExpensiveExpense } from '../utils/helpers';

/* ── Şifre değiştirme formu ── */
function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const { changePassword } = useApp();
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.newPw !== form.confirm) { setError('Yeni şifreler eşleşmiyor.'); return; }
    const result = changePassword(form.current, form.newPw);
    if (!result.success) { setError(result.error ?? 'Hata.'); return; }
    setSuccess(true);
    setTimeout(onClose, 1200);
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600 font-semibold">✓ Şifre başarıyla değiştirildi!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {[
        { label: 'Mevcut Şifre', key: 'current' as const, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
        { label: 'Yeni Şifre',   key: 'newPw'   as const, show: showNew,     toggle: () => setShowNew(v => !v) },
        { label: 'Yeni Şifre (Tekrar)', key: 'confirm' as const, show: showNew, toggle: () => setShowNew(v => !v) },
      ].map(field => (
        <div key={field.key}>
          <label className="block text-xs font-semibold text-slate-600 mb-1">{field.label}</label>
          <div className="relative">
            <input
              type={field.show ? 'text' : 'password'}
              value={form[field.key]}
              onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
              className="input-field pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={field.toggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {field.show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      ))}

      {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm py-2">İptal</button>
        <button type="submit" className="btn-primary flex-1 text-sm py-2">Değiştir</button>
      </div>
    </form>
  );
}

/* ── Hesap silme onay ── */
function DeleteAccountConfirm({ onClose }: { onClose: () => void }) {
  const { deleteAccount, currentUser } = useApp();
  const [input, setInput] = useState('');
  const confirmWord = 'SİL';

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Bu işlem <strong>geri alınamaz</strong>. Hesabın, tüm harcamaların, kartların ve hedeflerin kalıcı olarak silinecek.
      </p>
      <p className="text-sm text-slate-600">
        Onaylamak için aşağıya <strong className="text-red-500">{confirmWord}</strong> yazın:
      </p>
      <input
        className="input-field border-red-200 focus:ring-red-300"
        value={input}
        onChange={e => setInput(e.target.value.toUpperCase())}
        placeholder={confirmWord}
      />
      <p className="text-xs text-slate-400">Hesap: {currentUser?.email}</p>
      <div className="flex gap-2">
        <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2">İptal</button>
        <button
          onClick={deleteAccount}
          disabled={input !== confirmWord}
          className="flex-1 text-sm py-2 rounded-xl font-semibold text-white transition-colors disabled:opacity-40 bg-red-500 hover:bg-red-600"
        >
          Hesabı Kalıcı Sil
        </button>
      </div>
    </div>
  );
}

/* ── Ana bileşen ── */
export function ProfilePage() {
  const { state, dispatch, currentUser } = useApp();
  const imgRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: state.profile.name, surname: state.profile.surname });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const mostExpensive = getMostExpensiveExpense(state.expenses);

  const joinDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  function handlePhotoChange(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => dispatch({ type: 'UPDATE_PROFILE', payload: { photo: e.target?.result as string } });
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    if (!form.name.trim()) return;
    dispatch({ type: 'UPDATE_PROFILE', payload: { name: form.name.trim(), surname: form.surname.trim() } });
    setEditing(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── Profil Kartı ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#355e3b] to-emerald-600 flex items-center justify-center">
              {state.profile.photo ? (
                <img src={state.profile.photo} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {(state.profile.name[0] ?? 'K').toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => imgRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow"
              style={{ backgroundColor: '#355e3b' }}
            >
              <Camera size={13} />
            </button>
            <input ref={imgRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handlePhotoChange(e.target.files[0])} />
          </div>

          {/* Ad/Soyad */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input className="input-field text-sm flex-1" placeholder="Ad"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  <input className="input-field text-sm flex-1" placeholder="Soyad"
                    value={form.surname} onChange={e => setForm(p => ({ ...p, surname: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveProfile} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1">
                    <Check size={13} /> Kaydet
                  </button>
                  <button onClick={() => { setEditing(false); setForm({ name: state.profile.name, surname: state.profile.surname }); }}
                    className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1">
                    <X size={13} /> İptal
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-slate-800">{state.profile.name} {state.profile.surname}</h2>
                <p className="text-sm text-slate-400 mt-0.5">KFU Kullanıcısı</p>
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-sm mt-2 font-medium"
                  style={{ color: '#355e3b' }}>
                  <Edit2 size={13} /> Ad/Soyad Düzenle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 text-center">
          {[
            { label: 'Harcama',  value: state.expenses.length },
            { label: 'Gelir',    value: state.incomes.length  },
            { label: 'Kart',     value: state.cards.length    },
            { label: 'Hedef',    value: state.goals.length    },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hesap Bilgileri ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        <div className="px-5 py-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Hesap Bilgileri</h3>
        </div>

        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Mail size={15} className="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">E-posta Adresi</p>
            <p className="text-sm font-medium text-slate-700 truncate">{currentUser?.email ?? '—'}</p>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">Değiştirilemez</span>
        </div>

        {joinDate && (
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Calendar size={15} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Kayıt Tarihi</p>
              <p className="text-sm font-medium text-slate-700">{joinDate}</p>
            </div>
          </div>
        )}

        <div className="px-5 py-4">
          <button
            onClick={() => { setShowPasswordForm(v => !v); setShowDeleteConfirm(false); }}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Lock size={15} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Şifre Değiştir</p>
              <p className="text-xs text-slate-400">Hesap şifreni güncelle</p>
            </div>
            <span className="text-slate-300 text-xs">{showPasswordForm ? '▲' : '▼'}</span>
          </button>

          {showPasswordForm && (
            <div className="mt-4">
              <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />
            </div>
          )}
        </div>
      </div>

      {/* ── En Pahalı Harcama ── */}
      {mostExpensive && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} />
            <p className="font-semibold text-sm">En Pahalı Harcaman</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(mostExpensive.amount)}</p>
          <p className="text-orange-100 text-sm">{mostExpensive.location}</p>
        </div>
      )}

      {/* ── Tehlikeli Bölge ── */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-red-50 flex items-center gap-2">
          <Shield size={16} className="text-red-500" />
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide">Tehlikeli Bölge</h3>
        </div>

        <div className="px-5 py-4">
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Hesabı Sil</p>
                <p className="text-xs text-slate-400 mt-0.5">Hesabın ve tüm verileriniz kalıcı olarak silinir</p>
              </div>
              <button
                onClick={() => { setShowDeleteConfirm(true); setShowPasswordForm(false); }}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <Trash2 size={14} /> Sil
              </button>
            </div>
          ) : (
            <DeleteAccountConfirm onClose={() => setShowDeleteConfirm(false)} />
          )}
        </div>
      </div>

    </div>
  );
}
