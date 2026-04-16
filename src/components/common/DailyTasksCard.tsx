import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDailyProgress } from '../../utils/gamification';

export function DailyTasksCard() {
  const { state } = useApp();
  const { tasks, completedCount } = getDailyProgress(state);
  const total = tasks.length;
  const allDone = completedCount === total;
  const progressPct = Math.round((completedCount / total) * 100);

  // Kutlama animasyonu — tüm görevler tamamlandığında bir kez göster
  const [showCelebration, setShowCelebration] = useState(false);
  const prevDoneRef = useRef(completedCount);

  useEffect(() => {
    if (completedCount === total && prevDoneRef.current < total) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 3500);
      return () => clearTimeout(t);
    }
    prevDoneRef.current = completedCount;
  }, [completedCount, total]);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 relative overflow-hidden transition-colors ${allDone ? 'border-green-200' : 'border-slate-100'}`}>
      {/* Kutlama confetti katmanı */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="text-5xl animate-bounce">🎉</span>
          <div className="absolute inset-0 celebration-burst" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Günlük Görevler</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {allDone ? 'Harika! Bugün tüm görevleri tamamladın 🌟' : `${completedCount}/${total} tamamlandı`}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
          style={{
            background: allDone ? '#f0fdf4' : '#f8fafc',
            color: allDone ? '#16a34a' : '#64748b',
            border: `2px solid ${allDone ? '#86efac' : '#e2e8f0'}`,
          }}
        >
          {progressPct}%
        </div>
      </div>

      {/* İlerleme çubuğu */}
      <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progressPct}%`,
            backgroundColor: allDone ? '#16a34a' : '#355e3b',
          }}
        />
      </div>

      {/* Görev listesi */}
      <div className="grid grid-cols-2 gap-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${
              task.done ? 'bg-green-50' : 'bg-slate-50'
            }`}
          >
            <span className="text-base leading-none">{task.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${task.done ? 'text-green-700' : 'text-slate-600'}`}>
                {task.title}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{task.description}</p>
            </div>
            {task.done && (
              <span className="text-green-500 text-sm shrink-0">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
