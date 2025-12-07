'use client';

import { useState, useEffect } from 'react';
import { ActionType, RestLimitState } from '@/types/game';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { getRemainingRestCount } from '@/lib/gameEngine';
import { ACTION_EFFECTS, GAME_CONSTANTS } from '@/lib/constants';
import { Tooltip } from '@/components/Tooltip';
import { useTooltip } from '@/hooks/useTooltip';

interface ActionButtonsProps {
  onAction: (action: ActionType) => void;
  energy: number;
  restLimit: RestLimitState;
  disabled?: boolean;
  language: Language;
}

export function ActionButtons({ onAction, energy, restLimit, disabled = false, language }: ActionButtonsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const remainingRest = getRemainingRestCount(restLimit);
  const isRestDisabled = remainingRest <= 0;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const restTooltip = useTooltip({ id: 'rest-tooltip', isMobile });

  const buttons: Array<{ action: ActionType; label: string; icon: string; color: string }> = [
    { action: 'study', label: t('study', language), icon: '📚', color: 'bg-purple-500 hover:bg-purple-600' },
    { action: 'play', label: t('play', language), icon: '🎮', color: 'bg-green-500 hover:bg-green-600' },
    { action: 'rest', label: t('rest', language), icon: '😴', color: 'bg-blue-500 hover:bg-blue-600' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {buttons.map(({ action, label, icon, color }) => {
        const requiredEnergy = action === 'rest' ? 0 : Math.abs(ACTION_EFFECTS[action].energy);
        const isActionDisabled = disabled ||
          (action !== 'rest' && energy < requiredEnergy) ||
          (action === 'rest' && isRestDisabled);

        return (
          <button
            key={action}
            onClick={() => onAction(action)}
            disabled={isActionDisabled}
            className={`
              flex flex-col items-center justify-center gap-1 p-4 rounded-xl text-white font-semibold
              transition-all duration-200 transform min-h-[100px]
              ${isActionDisabled ? 'bg-gray-400 cursor-not-allowed opacity-50' : `${color} hover:scale-105 active:scale-95`}
            `}
            title={isActionDisabled && action !== 'rest' ? t('notEnoughEnergy', language) : undefined}
          >
            <span className="text-3xl">{icon}</span>
            <span className="text-sm">{label}</span>
            {action === 'rest' && (
              <span className="text-[10px] sm:text-xs opacity-80 flex items-center gap-0.5 whitespace-nowrap">
                {remainingRest > 0
                  ? `${remainingRest}/${GAME_CONSTANTS.MAX_REST_PER_DAY}`
                  : t('noRestRemaining', language)
                }
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    restTooltip.handleClick();
                  }}
                >
                  <Tooltip
                    content={t('restLimitTooltip', language)}
                    isVisible={restTooltip.isVisible}
                    onMouseEnter={restTooltip.handleMouseEnter}
                    onMouseLeave={restTooltip.handleMouseLeave}
                    onClick={restTooltip.handleClick}
                  >
                    <span className="text-white/80 text-xs sm:text-sm">ⓘ</span>
                  </Tooltip>
                </span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
