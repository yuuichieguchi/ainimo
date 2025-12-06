'use client';

import { GameParameters } from '@/types/game';
import { getMoodType, getIntelligenceTier } from '@/lib/gameEngine';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface AinimoPetProps {
  parameters: GameParameters;
  language: Language;
}

export function AinimoPet({ parameters, language }: AinimoPetProps) {
  const mood = getMoodType(parameters.mood);
  const tier = getIntelligenceTier(parameters.intelligence);

  const getEmoji = (): string => {
    if (parameters.energy < 20) return '😴';

    switch (tier) {
      case 'baby':
        switch (mood) {
          case 'happy':
            return '🥚✨';
          case 'normal':
            return '🥚';
          case 'tired':
            return '🥚💤';
          case 'sad':
            return '🥚💧';
          default:
            return '🥚';
        }
      case 'child':
        switch (mood) {
          case 'happy':
            return '🐣😊';
          case 'normal':
            return '🐣';
          case 'tired':
            return '🐣💤';
          case 'sad':
            return '🐣😢';
          default:
            return '🐣';
        }
      case 'teen':
        switch (mood) {
          case 'happy':
            return '🐤✨';
          case 'normal':
            return '🐤';
          case 'tired':
            return '🐤💤';
          case 'sad':
            return '🐤😞';
          default:
            return '🐤';
        }
      case 'adult':
        switch (mood) {
          case 'happy':
            return '🐦⭐';
          case 'normal':
            return '🐦';
          case 'tired':
            return '🐦💤';
          case 'sad':
            return '🐦😔';
          default:
            return '🐦';
        }
      default:
        return '🥚';
    }
  };

  const getTierLabel = (): string => {
    switch (tier) {
      case 'baby':
        return t('tierBaby', language);
      case 'child':
        return t('tierChild', language);
      case 'teen':
        return t('tierTeen', language);
      case 'adult':
        return t('tierAdult', language);
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg">
      <div className="text-8xl animate-bounce">{getEmoji()}</div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ainimo</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('level', language)} {parameters.level} {getTierLabel()}
        </p>
      </div>
    </div>
  );
}
