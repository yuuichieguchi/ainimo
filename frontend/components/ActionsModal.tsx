'use client';

import { useEffect, useCallback, useState } from 'react';
import { ActionType, RestLimitState } from '@/types/game';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { getRemainingRestCount } from '@/lib/gameEngine';
import { ACTION_EFFECTS, GAME_CONSTANTS } from '@/lib/constants';
import { Tooltip } from '@/components/Tooltip';
import { useTooltip } from '@/hooks/useTooltip';

interface ActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: ActionType) => void;
  energy: number;
  restLimit: RestLimitState;
  language: Language;
}

export function ActionsModal({
  isOpen,
  onClose,
  onAction,
  energy,
  restLimit,
  language,
}: ActionsModalProps) {
  const remainingRest = getRemainingRestCount(restLimit);
  const isRestDisabled = remainingRest <= 0;
  const restTooltip = useTooltip({ id: 'rest-modal-tooltip', isMobile: false });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleAction = (action: ActionType) => {
    onAction(action);
    onClose();
  };

  const actions: Array<{
    action: ActionType;
    label: string;
    icon: string;
    color: string;
    description: string;
  }> = [
    {
      action: 'study',
      label: t('study', language),
      icon: '📚',
      color: 'from-purple-500 to-purple-600',
      description: language === 'ja' ? '知能と記憶力が上がります' : 'Increases intelligence and memory',
    },
    {
      action: 'play',
      label: t('play', language),
      icon: '🎮',
      color: 'from-green-500 to-teal-500',
      description: language === 'ja' ? '親密度が上がります' : 'Increases friendliness',
    },
    {
      action: 'rest',
      label: t('rest', language),
      icon: '😴',
      color: 'from-blue-500 to-blue-600',
      description: language === 'ja' ? '体力を回復します' : 'Restores energy',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="actions-modal-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="actions-modal-title" className="text-xl font-bold text-gray-800 dark:text-white">
            {t('actions', language)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* エネルギー表示 */}
        <div className="mb-4 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
          <span className="text-lg">⚡</span>
          <span className="font-medium">{t('energy', language)}: {energy}</span>
        </div>

        <div className="space-y-3">
          {actions.map(({ action, label, icon, color, description }) => {
            const requiredEnergy = action === 'rest' ? 0 : Math.abs(ACTION_EFFECTS[action].energy);
            const isActionDisabled =
              (action !== 'rest' && energy < requiredEnergy) ||
              (action === 'rest' && isRestDisabled);

            return (
              <button
                key={action}
                onClick={() => handleAction(action)}
                disabled={isActionDisabled}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl text-white font-semibold
                  transition-all duration-200 transform min-h-[88px]
                  ${
                    isActionDisabled
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : `bg-gradient-to-r ${color} hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg`
                  }
                `}
              >
                <span className="text-3xl">{icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-lg">{label}</div>
                  <div className="text-sm opacity-80">{description}</div>
                </div>
                {action === 'rest' && (
                  <div
                    className="flex items-center gap-1 text-sm opacity-80 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {remainingRest > 0
                      ? `${remainingRest}/${GAME_CONSTANTS.MAX_REST_PER_DAY}`
                      : t('noRestRemaining', language)}
                    <Tooltip
                      content={t('restLimitTooltip', language)}
                      isVisible={restTooltip.isVisible}
                      onMouseEnter={restTooltip.handleMouseEnter}
                      onMouseLeave={restTooltip.handleMouseLeave}
                      onClick={restTooltip.handleClick}
                    >
                      <span className="text-white/80 text-sm cursor-help">ⓘ</span>
                    </Tooltip>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
