'use client';

import { MiniGameType, CanPlayResult } from '@/types/miniGame';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { MINI_GAME_CONFIGS, MINI_GAME_TYPES } from '@/lib/miniGameDefinitions';

interface MiniGameSelectorProps {
  energy: number;
  canPlay: (gameType: MiniGameType, energy: number) => CanPlayResult;
  getCooldownRemaining: (gameType: MiniGameType) => number;
  onSelectGame: (gameType: MiniGameType) => void;
  language: Language;
}

export function MiniGameSelector({
  energy,
  canPlay,
  getCooldownRemaining,
  onSelectGame,
  language,
}: MiniGameSelectorProps) {
  const formatCooldown = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {MINI_GAME_TYPES.map((gameType) => {
        const config = MINI_GAME_CONFIGS[gameType];
        const playResult = canPlay(gameType, energy);
        const cooldownRemaining = getCooldownRemaining(gameType);
        const isDisabled = !playResult.canPlay;

        return (
          <button
            key={gameType}
            onClick={() => onSelectGame(gameType)}
            disabled={isDisabled}
            className={`
              p-4 rounded-xl transition-all transform
              ${isDisabled
                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 shadow-lg'
              }
            `}
          >
            <div className="text-4xl mb-2">{config.icon}</div>
            <h3 className={`font-bold ${isDisabled ? 'text-gray-500 dark:text-gray-400' : 'text-white'}`}>
              {config.name[language]}
            </h3>
            <p className={`text-sm mt-1 ${isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-white/80'}`}>
              {config.description[language]}
            </p>

            <div className={`mt-3 text-xs ${isDisabled ? 'text-gray-400' : 'text-white/70'}`}>
              <span className="inline-flex items-center gap-1">
                ⚡ {config.energyCost}
              </span>
            </div>

            {playResult.reason === 'cooldown' && cooldownRemaining > 0 && (
              <div className="mt-2 text-xs text-orange-500 dark:text-orange-400 font-medium">
                ⏱️ {formatCooldown(cooldownRemaining)}
              </div>
            )}

            {playResult.reason === 'energy' && (
              <div className="mt-2 text-xs text-red-500 dark:text-red-400 font-medium">
                {t('notEnoughEnergy', language)}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
