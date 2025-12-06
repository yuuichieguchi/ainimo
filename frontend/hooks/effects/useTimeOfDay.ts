'use client';

import { useState, useEffect } from 'react';
import { TimeOfDayType, TIME_OF_DAY_GRADIENTS } from '@/types/effects';

// 時間から時間帯を判定
function getTimeOfDay(hour: number): TimeOfDayType {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

interface UseTimeOfDayOptions {
  updateInterval?: number; // 更新間隔（ms）
  enabled?: boolean;
}

export function useTimeOfDay(options: UseTimeOfDayOptions = {}) {
  const { updateInterval = 60000, enabled = true } = options; // デフォルト1分ごと

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayType>(() => {
    if (typeof window === 'undefined') return 'day';
    return getTimeOfDay(new Date().getHours());
  });

  const [hour, setHour] = useState(() => {
    if (typeof window === 'undefined') return 12;
    return new Date().getHours();
  });

  useEffect(() => {
    if (!enabled) return;

    const update = () => {
      const currentHour = new Date().getHours();
      setHour(currentHour);
      setTimeOfDay(getTimeOfDay(currentHour));
    };

    update();
    const interval = setInterval(update, updateInterval);

    return () => clearInterval(interval);
  }, [enabled, updateInterval]);

  // 現在の時間帯に応じたグラデーション色
  const gradient = TIME_OF_DAY_GRADIENTS[timeOfDay];

  // 時間帯に応じた背景クラス（Tailwind）
  const backgroundClass = `bg-gradient-to-b from-[${gradient.from}] to-[${gradient.to}]`;

  // 時間帯に応じたテキスト色（暗い時間帯は白、明るい時間帯は黒）
  const isDark = timeOfDay === 'night' || timeOfDay === 'dusk';

  return {
    timeOfDay,
    hour,
    gradient,
    backgroundClass,
    isDark,
  };
}
