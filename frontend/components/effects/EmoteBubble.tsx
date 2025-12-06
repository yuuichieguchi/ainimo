'use client';

import { memo } from 'react';
import { EmoteType, EMOTE_EMOJI } from '@/types/effects';

interface EmoteBubbleProps {
  emote: EmoteType | null;
  isVisible: boolean;
  position?: 'top' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const POSITION_CLASSES = {
  top: '-top-8 left-1/2 -translate-x-1/2',
  'top-right': '-top-6 -right-2',
  'top-left': '-top-6 -left-2',
};

const SIZE_CLASSES = {
  sm: 'text-xl w-8 h-8',
  md: 'text-2xl w-10 h-10',
  lg: 'text-3xl w-12 h-12',
};

export const EmoteBubble = memo(function EmoteBubble({
  emote,
  isVisible,
  position = 'top-right',
  size = 'md',
  className = '',
}: EmoteBubbleProps) {
  if (!emote) return null;

  const positionClass = POSITION_CLASSES[position];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      className={`
        absolute ${positionClass} ${sizeClass}
        flex items-center justify-center
        bg-white dark:bg-gray-700
        rounded-full shadow-lg
        transform transition-all duration-300 ease-out
        ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        ${className}
      `}
      style={{
        animation: isVisible ? 'emote-bounce 0.5s ease-out' : 'none',
      }}
      aria-hidden="true"
    >
      <span className="animate-pulse">{EMOTE_EMOJI[emote]}</span>
    </div>
  );
});
