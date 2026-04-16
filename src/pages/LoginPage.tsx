import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Tab = 'login' | 'register';

/* ── Ortak input bileşeni ── */
function AuthInput({
  label, icon, type = 'text', value, onChange, placeholder, error,
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </div>
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input-field pl-10 ${isPassword ? 'pr-10' : ''} ${error ? 'border-red-300 focus:ring-red-200' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ── Giriş formu ── */
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useApp();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('E-posta adresi gereklidir.'); return; }
    if (!password)     { setError('Şifre gereklidir.'); return; }

    setLoading(true);
    // Kısa gecikme ile UX iyileştirme
    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error ?? 'Giriş yapılamadı.');
        setLoading(false);
      }
    }, 300);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        label="E-posta Adresi"
        icon={<Mail size={15} />}
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="ornek@email.com"
      />
      <AuthInput
        label="Şifre"
        icon={<Lock size={15} />}
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-70 text-white rounded-xl transition-colors"
        style={{ backgroundColor: '#355e3b' }}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <><span>Giriş Yap</span><ArrowRight size={17} /></>
        )}
      </button>

      <p className="text-center text-sm text-slate-500">
        Hesabın yok mu?{' '}
        <button type="button" onClick={onSwitch} className="text-[#355e3b] font-semibold hover:underline">
          Kayıt Ol
        </button>
      </p>
    </form>
  );
}

/* ── Kayıt formu ── */
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useApp();
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  function set(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
    setGlobalError('');
  }

  function validate(): boolean {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())    e.name    = 'Ad gereklidir.';
    if (!form.surname.trim()) e.surname = 'Soyad gereklidir.';
    if (!form.email.trim() || !/@.+\.edu\.tr$/i.test(form.email)) e.email = 'Sadece .edu.tr uzantılı üniversite e-postası kabul edilmektedir.';
    if (form.password.length < 4) e.password = 'Şifre en az 4 karakter olmalıdır.';
    if (form.confirm !== form.password) e.confirm = 'Şifreler eşleşmiyor.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      const result = register(form.name, form.surname, form.email, form.password);
      if (!result.success) {
        setGlobalError(result.error ?? 'Kayıt olunamadı.');
        setLoading(false);
      } else {
        setSuccess(true);
      }
    }, 400);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Hesap Oluşturuldu!</h3>
        <p className="text-slate-500 text-sm">Hoş geldin, {form.name}! Uygulamaya yönlendiriliyorsun...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3">
        <AuthInput label="Ad" icon={<User size={15} />} value={form.name}    onChange={(v) => set('name', v)}    placeholder="Adın" error={errors.name} />
        <AuthInput label="Soyad" icon={<User size={15} />} value={form.surname} onChange={(v) => set('surname', v)} placeholder="Soyadın" error={errors.surname} />
      </div>
      <AuthInput
        label="E-posta Adresi"
        icon={<Mail size={15} />}
        type="email"
        value={form.email}
        onChange={(v) => set('email', v)}
        placeholder="ornek@email.com"
        error={errors.email}
      />
      <AuthInput
        label="Şifre"
        icon={<Lock size={15} />}
        type="password"
        value={form.password}
        onChange={(v) => set('password', v)}
        placeholder="En az 4 karakter"
        error={errors.password}
      />
      <AuthInput
        label="Şifre Tekrar"
        icon={<Lock size={15} />}
        type="password"
        value={form.confirm}
        onChange={(v) => set('confirm', v)}
        placeholder="Şifreni tekrar gir"
        error={errors.confirm}
      />

      {globalError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          {globalError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-70 text-white rounded-xl transition-colors"
        style={{ backgroundColor: '#355e3b' }}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <><span>Hesap Oluştur</span><ArrowRight size={17} /></>
        )}
      </button>

      <p className="text-center text-sm text-slate-500">
        Zaten hesabın var mı?{' '}
        <button type="button" onClick={onSwitch} className="text-[#355e3b] font-semibold hover:underline">
          Giriş Yap
        </button>
      </p>
    </form>
  );
}

/* ── Ana bileşen ── */
export function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#355e3b' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-7">
          <img src="/3.png" alt="KFU Logo" className="w-40 h-40 object-cover rounded-3xl mx-auto mb-3 shadow-2xl" />
          <p className="text-white/80 text-sm">Üniversite Öğrencileri için Kişisel Finans</p>
        </div>

        {/* Kart */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Tab seçici */}
          <div className="flex border-b border-slate-100">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'text-[#355e3b] border-b-2 border-[#355e3b] bg-green-50/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-7">
            {tab === 'login'
              ? <LoginForm    onSwitch={() => setTab('register')} />
              : <RegisterForm onSwitch={() => setTab('login')}    />
            }
          </div>
        </div>

        <p className="text-xs text-white/50 text-center mt-5">
          Verileriniz yalnızca bu cihazda saklanır.
        </p>
      </div>
    </div>
  );
}
