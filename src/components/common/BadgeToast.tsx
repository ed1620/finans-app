import { useEffect, useState } from 'react';
import { ALL_BADGES } from '../../utils/gamification';

interface Props {
  badgeIds: string[];
  onDone: () => void;
}

export function BadgeToast({ badgeIds, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (badgeIds.length === 0) return;
    setIndex(0);
    setVisible(true);
  }, [badgeIds]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      if (index < badgeIds.length - 1) {
        setIndex(i => i + 1);
      } else {
        setVisible(false);
        onDone();
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [visible, index, badgeIds.length, onDone]);

  if (!visible || badgeIds.length === 0) return null;

  const badge = ALL_BADGES.find(b => b.id === badgeIds[index]);
  if (!badge) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-yellow-200 p-4 flex items-center gap-4 max-w-xs">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl shrink-0 shadow">
          {badge.icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-0.5">🎉 Rozet Kazandın!</p>
          <p className="font-bold text-slate-800 text-sm">{badge.name}</p>
          <p className="text-xs text-slate-500">{badge.description}</p>
          <p className="text-xs text-yellow-600 font-medium mt-0.5">+{badge.xpReward} XP</p>
        </div>
      </div>
    </div>
  );
}
