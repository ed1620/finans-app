import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const steps = [
  {
    emoji: '🎉',
    title: 'Hoş Geldin!',
    description: 'KFU\'ya hoş geldin! Uygulamayı tanıman için hesabına örnek veriler yükledik. İstediğin zaman bunları silebilir, kendi verilerini ekleyebilirsin.',
    color: '#355e3b',
    bg: '#f0fdf4',
  },
  {
    emoji: '💳',
    title: 'Kartlarım',
    description: 'Banka kartlarını, KYK kartını, Papara veya kredi kartlarını ekle. Tüm hesaplarını tek ekranda yönet, bakiyelerini takip et.',
    color: '#1d4ed8',
    bg: '#eff6ff',
  },
  {
    emoji: '💸',
    title: 'Harcama Ekle',
    description: 'Sağ üstteki "+ Harcama" butonuyla her harcamanı kaydet. Kategori, konum ve tutar girerek nereye ne kadar harcadığını gör.',
    color: '#b45309',
    bg: '#fffbeb',
  },
  {
    emoji: '📊',
    title: 'Raporlar',
    description: 'Aylık ve haftalık grafiklerle harcama alışkanlıklarını analiz et. Hangi kategoriye ne kadar harcadığını pasta grafiğiyle görüntüle.',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    emoji: '🎯',
    title: 'Hedefler & Rozet',
    description: 'Tatil fonu, kafe limiti gibi hedefler belirle. Düzenli kullandıkça XP kazan, rozet topla ve finansal alışkanlıklarını geliştir!',
    color: '#0f766e',
    bg: '#f0fdfa',
  },
];

export function OnboardingModal() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Üst renkli bölge */}
        <div
          className="relative flex flex-col items-center justify-center pt-10 pb-8 px-6 text-center transition-colors duration-500"
          style={{ backgroundColor: current.bg }}
        >
          <button
            onClick={completeOnboarding}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>

          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-md transition-all duration-500"
            style={{ backgroundColor: `${current.color}18`, border: `2px solid ${current.color}30` }}
          >
            {current.emoji}
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">{current.title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{current.description}</p>
        </div>

        {/* Alt bölge */}
        <div className="px-6 py-5">
          {/* Adım noktaları */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  backgroundColor: i === step ? current.color : '#e2e8f0',
                }}
              />
            ))}
          </div>

          {/* Butonlar */}
          <div className="flex gap-3">
            {!isLast && (
              <button
                onClick={completeOnboarding}
                className="flex-1 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors rounded-xl"
              >
                Atla
              </button>
            )}
            <button
              onClick={() => isLast ? completeOnboarding() : setStep(s => s + 1)}
              className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              style={{ backgroundColor: current.color }}
            >
              {isLast ? (
                <span>Başla! 🚀</span>
              ) : (
                <><span>İleri</span><ChevronRight size={16} /></>
              )}
            </button>
          </div>

          {/* Örnek veri notu */}
          {step === 0 && (
            <p className="text-xs text-center text-slate-400 mt-3">
              ✨ Hesabına örnek kartlar, harcamalar ve gelirler yüklendi
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
