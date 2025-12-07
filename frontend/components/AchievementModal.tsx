'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  UnlockedAchievement,
  AchievementStats,
} from '@/types/achievement';
import { GameParameters } from '@/types/game';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { isUnlocked, calculateProgress } from '@/lib/achievementEngine';
import { ACHIEVEMENT_CATEGORIES } from '@/lib/achievementDefinitions';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  unlockedAchievements: UnlockedAchievement[];
  stats: AchievementStats;
  parameters: GameParameters;
  selectedTitleId: string | null;
  onSelectTitle: (id: string | null) => void;
  language: Language;
}

// レアリティに応じた背景色
const rarityBgColors: Record<AchievementRarity, string> = {
  common: 'bg-gray-100 dark:bg-gray-700',
  uncommon: 'bg-green-50 dark:bg-green-900/30',
  rare: 'bg-blue-50 dark:bg-blue-900/30',
  epic: 'bg-purple-50 dark:bg-purple-900/30',
  legendary: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30',
};

// レアリティに応じたボーダー色
const rarityBorderColors: Record<AchievementRarity, string> = {
  common: 'border-gray-300 dark:border-gray-600',
  uncommon: 'border-green-400 dark:border-green-600',
  rare: 'border-blue-400 dark:border-blue-600',
  epic: 'border-purple-400 dark:border-purple-600',
  legendary: 'border-yellow-400 dark:border-yellow-500',
};

// レアリティに応じたプログレスバー色
const rarityProgressColors: Record<AchievementRarity, string> = {
  common: 'bg-gray-400',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500',
};

export function AchievementModal({
  isOpen,
  onClose,
  achievements,
  unlockedAchievements,
  stats,
  parameters,
  selectedTitleId,
  onSelectTitle,
  language,
}: AchievementModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  // Escapeキーでモーダルを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // フィルタリングされた実績
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') {
      return achievements;
    }
    return achievements.filter(a => a.category === selectedCategory);
  }, [achievements, selectedCategory]);

  // 解除済み数 / 総数
  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダル */}
      <div className="fixed inset-4 md:inset-10 lg:inset-20 z-50 animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {t('achievements', language)}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {unlockedCount}/{totalCount}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 現在の称号 */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('achievementCurrentTitle', language)}:
              </span>
              <div className="flex items-center gap-2">
                {selectedTitleId ? (
                  <>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      「{achievements.find(a => a.id === selectedTitleId)?.title[language]}」
                    </span>
                    <button
                      onClick={() => onSelectTitle(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    {t('achievementNoTitle', language)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* カテゴリタブ */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('achievementAll', language)}
              </button>
              {ACHIEVEMENT_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.icon} {category.name[language]}
                </button>
              ))}
            </div>
          </div>

          {/* 実績リスト */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAchievements.map(achievement => {
                const unlocked = isUnlocked(achievement.id, unlockedAchievements);
                const progress = calculateProgress(achievement, stats, parameters);
                const isSelected = selectedTitleId === achievement.id;

                // シークレットで未解除の場合
                const isHidden = achievement.isSecret && !unlocked;

                return (
                  <div
                    key={achievement.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      unlocked
                        ? `${rarityBgColors[achievement.rarity]} ${rarityBorderColors[achievement.rarity]}`
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                    } ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                  >
                    {/* アイコンと名前 */}
                    <div className="flex items-start gap-3">
                      <span className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>
                        {isHidden ? '❓' : achievement.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold ${unlocked ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                          {isHidden ? t('achievementSecret', language) : achievement.name[language]}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {isHidden ? t('achievementSecretDesc', language) : achievement.description[language]}
                        </p>
                      </div>
                    </div>

                    {/* プログレスバー（未解除時のみ） */}
                    {!unlocked && !isHidden && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{t('achievementProgress', language)}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${rarityProgressColors[achievement.rarity]} transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 称号と選択ボタン（解除済みのみ） */}
                    {unlocked && !isHidden && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          「{achievement.title[language]}」
                        </span>
                        <button
                          onClick={() => onSelectTitle(isSelected ? null : achievement.id)}
                          className={`px-2 py-1 text-xs rounded-md transition-colors ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                          }`}
                        >
                          {isSelected ? '✓' : t('achievementSelectTitle', language)}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
