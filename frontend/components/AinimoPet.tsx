'use client';

import { forwardRef } from 'react';
import { GameParameters, ActionType, IntelligenceTier } from '@/types/game';
import { getMoodType, getIntelligenceTier } from '@/lib/gameEngine';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface AinimoPetProps {
  parameters: GameParameters;
  language: Language;
  currentActivity?: ActionType | null;
}

const IMAGE_PATHS: Record<IntelligenceTier, string> = {
  baby: '/basic_ainimo_baby.png',
  child: '/basic_ainimo_child.png',
  teen: '/basic_ainimo_teen.png',
  adult: '/basic_ainimo_adult.png',
};

export const AinimoPet = forwardRef<HTMLDivElement, AinimoPetProps>(
  ({ parameters, language, currentActivity }, ref) => {
    const mood = getMoodType(parameters.mood);
    const tier = getIntelligenceTier(parameters.intelligence);

    const getImagePath = (): string => {
      return IMAGE_PATHS[tier];
    };

    const getAnimationClass = (): string => {
      // babyの時は常にバウンス
      if (tier === 'baby') {
        return 'animate-[bounce-gentle_2s_ease-in-out_infinite]';
      }

      if (!currentActivity) return '';

      switch (currentActivity) {
        case 'study':
          return 'animate-study';
        case 'play':
          return 'animate-play';
        case 'rest':
          return 'animate-rest';
        default:
          return '';
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
      <div ref={ref} className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg">
      <div className={`w-32 h-32 ${getAnimationClass()}`}>
        <img
          src={getImagePath()}
          alt={`Ainimo ${getTierLabel()}`}
          // ダークモード時：白い目と口が暗い背景に溶け込まないよう縁取りを追加
          className="w-full h-full object-contain dark:[filter:drop-shadow(0_0_2px_rgba(0,0,0,1))_drop-shadow(0_0_4px_rgba(0,0,0,0.8))]"
          onError={(e) => {
            e.currentTarget.src = IMAGE_PATHS.baby;
          }}
        />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ainimo</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {getTierLabel()}
        </p>
      </div>
    </div>
    );
  }
);

AinimoPet.displayName = 'AinimoPet';
