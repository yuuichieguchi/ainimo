'use client';

import { PersonalityState, PersonalityType } from '@/types/personality';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import {
  PERSONALITY_ICONS,
  PERSONALITY_DEFINITIONS,
  PERSONALITY_VISUALS,
  MIN_ACTIONS_FOR_PERSONALITY,
} from '@/lib/personalityDefinitions';
import { getActionsUntilPersonality } from '@/lib/personalityEngine';
import { Tooltip } from '@/components/Tooltip';
import { useTooltip } from '@/hooks/useTooltip';
import { useState, useEffect } from 'react';

interface PersonalityBadgeProps {
  personalityState: PersonalityState;
  totalActions: number;
  language: Language;
}

export function PersonalityBadge({
  personalityState,
  totalActions,
  language,
}: PersonalityBadgeProps) {
  const [isMobile, setIsMobile] = useState(false);
  const tooltip = useTooltip({ id: 'personality-tooltip', isMobile });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { type, strength, isLocked } = personalityState;
  const definition = PERSONALITY_DEFINITIONS[type];
  const visuals = PERSONALITY_VISUALS[type];
  const icon = PERSONALITY_ICONS[type];

  // Get localized name
  const personalityName = definition.name[language];
  const personalityDesc = definition.description[language];

  // Calculate actions until personality develops
  const actionsNeeded = getActionsUntilPersonality(totalActions);

  // Build tooltip content
  let tooltipContent = '';
  if (type === 'none') {
    tooltipContent = t('personalityDeveloping', language)
      .replace('{count}', actionsNeeded.toString());
    if (actionsNeeded > 0) {
      tooltipContent = `${tooltipContent} (${actionsNeeded})`;
    }
  } else {
    tooltipContent = `${personalityDesc}\n${t('personalityStrength', language)}: ${Math.round(strength)}%`;
    if (isLocked) {
      tooltipContent += ` (${t('personalityLocked', language)})`;
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('personality', language)}
          </h4>
          <Tooltip
            content={tooltipContent}
            isVisible={tooltip.isVisible}
            onMouseEnter={tooltip.handleMouseEnter}
            onMouseLeave={tooltip.handleMouseLeave}
            onClick={tooltip.handleClick}
          >
            <span className="text-gray-500 dark:text-gray-400 text-sm cursor-help">ⓘ</span>
          </Tooltip>
        </div>
        {isLocked && (
          <span className="text-xs text-purple-500 dark:text-purple-400">🔒</span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        {/* Personality Icon with aura effect */}
        <div
          className="relative flex items-center justify-center w-12 h-12 rounded-full"
          style={{
            background: type !== 'none' ? visuals.backgroundGradient : undefined,
            boxShadow: type !== 'none' && strength > 30
              ? `0 0 ${Math.round(strength / 5)}px ${visuals.auraColor}`
              : undefined,
          }}
        >
          <span className="text-2xl">{icon}</span>
        </div>

        {/* Name and Strength */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className="font-bold"
              style={{
                color: type !== 'none' ? visuals.primaryColor : undefined,
              }}
            >
              {personalityName}
            </span>
          </div>

          {/* Strength bar */}
          {type !== 'none' && (
            <div className="mt-1">
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${strength}%`,
                    backgroundColor: visuals.primaryColor,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(strength)}%
              </span>
            </div>
          )}

          {/* Actions needed indicator */}
          {type === 'none' && actionsNeeded > 0 && (
            <div className="mt-1">
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 transition-all duration-500"
                  style={{
                    width: `${((MIN_ACTIONS_FOR_PERSONALITY - actionsNeeded) / MIN_ACTIONS_FOR_PERSONALITY) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('personalityActionsNeeded', language).replace('{count}', actionsNeeded.toString())}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Affinity breakdown for developed personalities */}
      {type !== 'none' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-4 gap-1 text-xs">
            {(['scholar', 'social', 'playful', 'zen'] as const).map((affinityType) => {
              const score = personalityState.affinityScores[affinityType];
              const affinityVisuals = PERSONALITY_VISUALS[affinityType];
              return (
                <div key={affinityType} className="text-center">
                  <span className="text-base">{PERSONALITY_ICONS[affinityType]}</span>
                  <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full"
                      style={{
                        width: `${score}%`,
                        backgroundColor: affinityVisuals.primaryColor,
                      }}
                    />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {Math.round(score)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
