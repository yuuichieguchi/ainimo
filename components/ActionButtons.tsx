'use client';

import { ActionType } from '@/types/game';

interface ActionButtonsProps {
  onAction: (action: ActionType) => void;
  energy: number;
  disabled?: boolean;
}

export function ActionButtons({ onAction, energy, disabled = false }: ActionButtonsProps) {
  const isLowEnergy = energy < 20;

  const buttons: Array<{ action: ActionType; label: string; icon: string; color: string }> = [
    { action: 'study', label: 'Study', icon: '📚', color: 'bg-purple-500 hover:bg-purple-600' },
    { action: 'play', label: 'Play', icon: '🎮', color: 'bg-green-500 hover:bg-green-600' },
    { action: 'rest', label: 'Rest', icon: '😴', color: 'bg-blue-500 hover:bg-blue-600' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {buttons.map(({ action, label, icon, color }) => {
        const isDisabled = disabled || (isLowEnergy && action !== 'rest');

        return (
          <button
            key={action}
            onClick={() => onAction(action)}
            disabled={isDisabled}
            className={`
              flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-white font-semibold
              transition-all duration-200 transform
              ${isDisabled ? 'bg-gray-400 cursor-not-allowed opacity-50' : `${color} hover:scale-105 active:scale-95`}
            `}
            title={isDisabled && action !== 'rest' ? 'Not enough energy! Let Ainimo rest.' : undefined}
          >
            <span className="text-3xl">{icon}</span>
            <span className="text-sm">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
