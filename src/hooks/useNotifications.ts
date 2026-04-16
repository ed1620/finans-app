import { useEffect, useRef } from 'react';

const REMINDER_HOURS = [9, 12, 15, 18, 21];

const MESSAGES = [
  'Bugünkü harcamalarını kaydetmeyi unutma! 💸',
  'Harcamalarını takip et, tasarrufu artır! 📊',
  'Bugün bir hedefine katkı yaptın mı? 🎯',
  'Finans alışkanlıklarını geliştirmek için KFU açık! 🚀',
  'Günlük harcama takibi serisini koru! 🔥',
];

function getRandomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

function minutesUntilNext(hours: number[]): number {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const targets = hours.map(h => h * 60);
  const next = targets.find(t => t > current) ?? (targets[0] + 24 * 60);
  return next - current;
}

export function useNotifications() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    function scheduleNext() {
      const minutesLeft = minutesUntilNext(REMINDER_HOURS);
      timerRef.current = setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('KFU – Hatırlatıcı 💚', {
            body: getRandomMessage(),
            icon: '/3.png',
          });
        }
        scheduleNext();
      }, minutesLeft * 60 * 1000);
    }

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
