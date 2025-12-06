'use client';

import { memo } from 'react';
import { FloatingValueEffect } from '@/types/effects';

// ステータスアイコン
const STAT_ICONS: Record<string, string> = {
  xp: '⭐',
  intelligence: '🧠',
  memory: '📚',
  friendliness: '💕',
  energy: '⚡',
  mood: '😊',
  level: '🎖️',
};

// ステータス色
const STAT_COLORS: Record<string, { positive: string; negative: string }> = {
  xp: { positive: 'text-yellow-500', negative: 'text-yellow-700' },
  intelligence: { positive: 'text-purple-500', negative: 'text-purple-700' },
  memory: { positive: 'text-blue-500', negative: 'text-blue-700' },
  friendliness: { positive: 'text-pink-500', negative: 'text-pink-700' },
  energy: { positive: 'text-orange-500', negative: 'text-red-500' },
  mood: { positive: 'text-green-500', negative: 'text-gray-500' },
  level: { positive: 'text-amber-500', negative: 'text-amber-700' },
};

interface FloatingValueItemProps {
  effect: FloatingValueEffect;
}

const FloatingValueItem = memo(function FloatingValueItem({
  effect,
}: FloatingValueItemProps) {
  const icon = STAT_ICONS[effect.stat] || '📊';
  const colors = STAT_COLORS[effect.stat] || { positive: 'text-green-500', negative: 'text-red-500' };
  const colorClass = effect.value > 0 ? colors.positive : colors.negative;
  const prefix = effect.value > 0 ? '+' : '';

  return (
    <div
      className={`
        absolute pointer-events-none
        font-bold text-lg
        ${colorClass}
        animate-float-up
      `}
      style={{
        left: effect.x,
        top: effect.y,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      <span className="flex items-center gap-1">
        {icon}
        <span>{prefix}{effect.value}</span>
      </span>
    </div>
  );
});

interface FloatingValuesProps {
  values: FloatingValueEffect[];
  className?: string;
}

export const FloatingValues = memo(function FloatingValues({
  values,
  className = '',
}: FloatingValuesProps) {
  if (values.length === 0) return null;

  return (
    <div
      className={`absolute inset-0 overflow-visible pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {values.map((effect) => (
        <FloatingValueItem key={effect.id} effect={effect} />
      ))}
    </div>
  );
});
