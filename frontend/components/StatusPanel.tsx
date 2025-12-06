'use client';

import { useState, useEffect } from 'react';
import { GameParameters } from '@/types/game';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { Tooltip } from '@/components/Tooltip';
import { useTooltip } from '@/hooks/useTooltip';

interface StatusPanelProps {
  parameters: GameParameters;
  language: Language;
  isLevelUpRecent?: boolean;
}

function ProgressBar({
  label,
  value,
  max = 100,
  tooltipContent,
  tooltipId,
  isMobile
}: {
  label: string;
  value: number;
  max?: number;
  tooltipContent: string;
  tooltipId: string;
  isMobile: boolean;
}) {
  const { isVisible, handleMouseEnter, handleMouseLeave, handleClick } = useTooltip({
    id: tooltipId,
    isMobile,
  });

  const percentage = Math.round((value / max) * 100);

  const getColorClass = () => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm items-center">
        <div className="flex items-center gap-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <Tooltip
            content={tooltipContent}
            isVisible={isVisible}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          >
            <span className="text-gray-500 dark:text-gray-400 text-base">ⓘ</span>
          </Tooltip>
        </div>
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

export function StatusPanel({ parameters, language, isLevelUpRecent = false }: StatusPanelProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const xpTooltip = useTooltip({ id: 'xp-tooltip', isMobile });

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('status', language)}</h3>
        <div
          className={`
            px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
            text-white font-bold text-lg inline-block
            ${isLevelUpRecent ? 'animate-pulse scale-110 shadow-lg shadow-purple-500/50' : ''}
            transition-transform duration-300
          `}
        >
          {t('level', language)} {parameters.level}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm items-center">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t('xp', language)}</span>
            <Tooltip
              content={t('xpTooltip', language)}
              isVisible={xpTooltip.isVisible}
              onMouseEnter={xpTooltip.handleMouseEnter}
              onMouseLeave={xpTooltip.handleMouseLeave}
              onClick={xpTooltip.handleClick}
            >
              <span className="text-gray-500 dark:text-gray-400 text-base">ⓘ</span>
            </Tooltip>
          </div>
          <span className="text-gray-600 dark:text-gray-400">{parameters.xp}/100</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${parameters.xp}%` }}
          />
        </div>
      </div>

      <ProgressBar
        label={t('intelligence', language)}
        value={parameters.intelligence}
        tooltipContent={t('intelligenceTooltip', language)}
        tooltipId="intelligence-tooltip"
        isMobile={isMobile}
      />
      <ProgressBar
        label={t('memory', language)}
        value={parameters.memory}
        tooltipContent={t('memoryTooltip', language)}
        tooltipId="memory-tooltip"
        isMobile={isMobile}
      />
      <ProgressBar
        label={t('friendliness', language)}
        value={parameters.friendliness}
        tooltipContent={t('friendlinessTooltip', language)}
        tooltipId="friendliness-tooltip"
        isMobile={isMobile}
      />
      <ProgressBar
        label={t('energy', language)}
        value={parameters.energy}
        tooltipContent={t('energyTooltip', language)}
        tooltipId="energy-tooltip"
        isMobile={isMobile}
      />
    </div>
  );
}
