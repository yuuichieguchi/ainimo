'use client';

import { forwardRef, useEffect, useRef, useCallback, useState } from 'react';
import { GameParameters, ActionType, IntelligenceTier } from '@/types/game';
import { PersonalityType } from '@/types/personality';
import { getMoodType, getIntelligenceTier } from '@/lib/gameEngine';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { PERSONALITY_VISUALS } from '@/lib/personalityDefinitions';
import {
  useParticles,
  useInteraction,
  useMoodFilter,
  useEmote,
  useEyeTracking,
} from '@/hooks/effects';
import { ParticleCanvas, EmoteBubble } from '@/components/effects';

interface AinimoPetProps {
  parameters: GameParameters;
  language: Language;
  currentActivity?: ActionType | null;
  previousTier?: IntelligenceTier | null;
  onInteraction?: (type: 'tap' | 'pet') => void;
  personalityType?: PersonalityType;
  personalityStrength?: number;
}

const IMAGE_PATHS: Record<IntelligenceTier, string> = {
  baby: '/basic_ainimo_baby.png',
  child: '/basic_ainimo_child.png',
  teen: '/basic_ainimo_teen.png',
  adult: '/basic_ainimo_adult.png',
};

export const AinimoPet = forwardRef<HTMLDivElement, AinimoPetProps>(
  ({ parameters, language, currentActivity, previousTier, onInteraction, personalityType, personalityStrength = 0 }, ref) => {
    const mood = getMoodType(parameters.mood);
    const tier = getIntelligenceTier(parameters.intelligence);
    const containerRef = useRef<HTMLDivElement>(null);

    // 成長アニメーション状態
    const [isGrowing, setIsGrowing] = useState(false);

    // エフェクトフック
    const { particles, emitForAction, emit } = useParticles({ enabled: true });
    const { filterObject, glowClass } = useMoodFilter({ mood: parameters.mood });
    const { activeEmote, isVisible, showEmote, showActionEmote } = useEmote();
    const { targetX, targetY, updateTarget } = useEyeTracking();

    // コンテナの中心座標を取得
    const getContainerCenter = useCallback(() => {
      if (!containerRef.current) return { x: 64, y: 64 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: rect.width / 2,
        y: rect.height / 2,
      };
    }, []);

    // タップハンドラー
    const handleTap = useCallback(
      (clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        emitForAction('tap', x, y);
        showEmote('heart', 1000);
        onInteraction?.('tap');
      },
      [emitForAction, showEmote, onInteraction]
    );

    // 長押し（撫でる）ハンドラー
    const handleLongPress = useCallback(
      (clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        emitForAction('pet', x, y);
        showEmote('heart', 1500);
        onInteraction?.('pet');
      },
      [emitForAction, showEmote, onInteraction]
    );

    // ドラッグ（目線追従）ハンドラー
    const handleDrag = useCallback(
      (clientX: number, clientY: number) => {
        updateTarget(clientX, clientY);
      },
      [updateTarget]
    );

    const { handlers, isPetting } = useInteraction({
      onTap: handleTap,
      onLongPress: handleLongPress,
      onDrag: handleDrag,
      enabled: true,
    });

    // アクティビティ変化時のエフェクト
    useEffect(() => {
      if (currentActivity) {
        const center = getContainerCenter();
        emitForAction(currentActivity, center.x, center.y);
        showActionEmote(currentActivity);
      }
    }, [currentActivity, emitForAction, showActionEmote, getContainerCenter]);

    // 成長時のエフェクト
    useEffect(() => {
      if (previousTier && previousTier !== tier) {
        setIsGrowing(true);
        const center = getContainerCenter();

        // 成長パーティクル
        emit({ type: 'sparkle', x: center.x, y: center.y, count: 15, spread: 80 });
        emit({ type: 'star', x: center.x, y: center.y, count: 10, spread: 60 });
        showEmote('sparkle', 2000);

        // アニメーション終了後にリセット
        const timer = setTimeout(() => setIsGrowing(false), 800);
        return () => clearTimeout(timer);
      }
    }, [tier, previousTier, emit, showEmote, getContainerCenter]);

    // グローバルマウス追従（目線）
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        updateTarget(e.clientX, e.clientY);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [updateTarget]);

    const getImagePath = (): string => {
      return IMAGE_PATHS[tier];
    };

    const getAnimationClass = (): string => {
      // 成長中
      if (isGrowing) {
        return 'animate-growth-pop';
      }

      // 撫でられ中
      if (isPetting) {
        return 'animate-petting';
      }

      // アクティビティがある時は各アクションのアニメーションを優先
      if (currentActivity) {
        switch (currentActivity) {
          case 'study':
            return 'animate-study';
          case 'play':
            return 'animate-play';
          case 'rest':
            return 'animate-rest';
          default:
            break;
        }
      }

      // アクティビティがない時、babyはふわふわ
      if (tier === 'baby') {
        return 'animate-[bounce-gentle_2s_ease-in-out_infinite]';
      }

      return '';
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

    // 目線オフセットのスタイル（ペット全体が微妙に動く）
    const eyeOffsetStyle = {
      transform: `translate(${targetX * 8}px, ${targetY * 5}px)`,
      transition: 'transform 0.15s ease-out',
    };

    // 性格エフェクトのスタイル
    const getPersonalityAuraStyle = () => {
      if (!personalityType || personalityType === 'none' || personalityStrength < 30) {
        return {};
      }

      const visuals = PERSONALITY_VISUALS[personalityType];
      const intensityFactor = personalityStrength / 100;

      return {
        boxShadow: `0 0 ${Math.round(20 * intensityFactor)}px ${visuals.auraColor}, 0 0 ${Math.round(40 * intensityFactor)}px ${visuals.auraColor}`,
      };
    };

    // 性格によるフィルター効果
    const getPersonalityFilterStyle = (): React.CSSProperties => {
      if (!personalityType || personalityType === 'none' || personalityStrength < 30) {
        return filterObject;
      }

      const visuals = PERSONALITY_VISUALS[personalityType];
      // 既存のmoodフィルターと性格フィルターを組み合わせる
      const moodFilterStr = filterObject.filter || '';
      const personalityFilter = visuals.filter || '';

      if (personalityFilter === 'none') {
        return filterObject;
      }

      // 性格フィルターの強度を性格強度で調整
      return {
        ...filterObject,
        filter: moodFilterStr ? `${moodFilterStr} ${personalityFilter}` : personalityFilter,
      };
    };

    return (
      <div
        ref={ref}
        className={`
          flex flex-col items-center gap-4 p-6
          bg-gradient-to-br from-blue-50 to-purple-50
          dark:from-gray-800 dark:to-gray-700
          rounded-2xl shadow-lg
          transition-all duration-300
          ${glowClass ? `shadow-xl ${glowClass}` : ''}
        `}
      >
        <div
          ref={containerRef}
          className={`relative w-32 h-32 select-none touch-none ${getAnimationClass()}`}
          style={getPersonalityAuraStyle()}
          {...handlers}
        >
          {/* ペット画像 */}
          <div style={eyeOffsetStyle}>
            <img
              src={getImagePath()}
              alt={`Ainimo ${getTierLabel()}`}
              className="w-full h-full object-contain dark:[filter:drop-shadow(0_0_2px_rgba(0,0,0,1))_drop-shadow(0_0_4px_rgba(0,0,0,0.8))]"
              style={getPersonalityFilterStyle()}
              draggable={false}
              onError={(e) => {
                e.currentTarget.src = IMAGE_PATHS.baby;
              }}
            />
          </div>

          {/* パーティクル */}
          <ParticleCanvas particles={particles} />

          {/* エモート */}
          <EmoteBubble emote={activeEmote} isVisible={isVisible} position="top-right" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ainimo</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{getTierLabel()}</p>
        </div>
      </div>
    );
  }
);

AinimoPet.displayName = 'AinimoPet';
