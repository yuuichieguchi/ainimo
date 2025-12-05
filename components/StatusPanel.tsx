'use client';

import { GameParameters } from '@/types/game';

interface StatusPanelProps {
  parameters: GameParameters;
}

function ProgressBar({ label, value, max = 100, color = 'blue' }: { label: string; value: number; max?: number; color?: string }) {
  const percentage = Math.round((value / max) * 100);

  const getColorClass = () => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-600 dark:text-gray-400">{value}/{max}</span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColorClass()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function StatusPanel({ parameters }: StatusPanelProps) {
  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Status</h3>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">XP</span>
          <span className="text-gray-600 dark:text-gray-400">{parameters.xp}/100</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${parameters.xp}%` }}
          />
        </div>
      </div>

      <ProgressBar label="Intelligence" value={parameters.intelligence} />
      <ProgressBar label="Memory" value={parameters.memory} />
      <ProgressBar label="Friendliness" value={parameters.friendliness} />
      <ProgressBar label="Energy" value={parameters.energy} />
    </div>
  );
}
