'use client';

import { useMemo } from 'react';
import { MoodType } from '@/types/game';
import { getMoodType } from '@/lib/gameEngine';

// 気分に応じたフィルター値
const MOOD_FILTERS: Record<MoodType, string> = {
  happy: 'hue-rotate(-10deg) saturate(1.15) brightness(1.05)',
  normal: 'none',
  tired: 'hue-rotate(10deg) saturate(0.85) brightness(0.95)',
  sad: 'hue-rotate(20deg) saturate(0.7) brightness(0.9)',
};

// 気分に応じたグロー色
const MOOD_GLOW: Record<MoodType, string> = {
  happy: 'shadow-yellow-300/50',
  normal: 'shadow-blue-300/30',
  tired: 'shadow-gray-400/30',
  sad: 'shadow-blue-500/40',
};

// 気分に応じた背景色のヒント
const MOOD_BG_TINT: Record<MoodType, string> = {
  happy: 'from-yellow-50 to-orange-50',
  normal: 'from-blue-50 to-purple-50',
  tired: 'from-gray-100 to-gray-200',
  sad: 'from-blue-100 to-indigo-100',
};

interface UseMoodFilterOptions {
  mood: number;
  enabled?: boolean;
}

export function useMoodFilter(options: UseMoodFilterOptions) {
  const { mood, enabled = true } = options;

  const moodType = useMemo(() => getMoodType(mood), [mood]);

  // CSSフィルター文字列
  const filterStyle = useMemo(() => {
    if (!enabled) return 'none';
    return MOOD_FILTERS[moodType];
  }, [enabled, moodType]);

  // グロークラス
  const glowClass = useMemo(() => {
    if (!enabled) return '';
    return MOOD_GLOW[moodType];
  }, [enabled, moodType]);

  // 背景色クラス
  const bgTintClass = useMemo(() => {
    if (!enabled) return '';
    return MOOD_BG_TINT[moodType];
  }, [enabled, moodType]);

  // インラインスタイル用
  const filterObject = useMemo(
    () => ({
      filter: filterStyle,
      transition: 'filter 0.5s ease-in-out',
    }),
    [filterStyle]
  );

  return {
    moodType,
    filterStyle,
    filterObject,
    glowClass,
    bgTintClass,
  };
}
