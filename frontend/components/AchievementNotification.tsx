'use client';

import { useEffect } from 'react';
import { Achievement, AchievementRarity } from '@/types/achievement';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface AchievementNotificationProps {
  isVisible: boolean;
  achievement: Achievement | null;
  language: Language;
  onClose: () => void;
}

// レアリティに応じたグラデーション
const rarityGradients: Record<AchievementRarity, string> = {
  common: 'from-gray-400 via-gray-500 to-gray-600',
  uncommon: 'from-green-400 via-green-500 to-emerald-600',
  rare: 'from-blue-400 via-blue-500 to-indigo-600',
  epic: 'from-purple-400 via-purple-500 to-violet-600',
  legendary: 'from-yellow-400 via-orange-500 to-red-500',
};

// レアリティに応じたテキストカラー
const rarityTextColors: Record<AchievementRarity, string> = {
  common: 'from-gray-600 to-gray-700 dark:from-gray-300 dark:to-gray-400',
  uncommon: 'from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500',
  rare: 'from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500',
  epic: 'from-purple-600 to-violet-700 dark:from-purple-400 dark:to-violet-500',
  legendary: 'from-yellow-600 to-orange-700 dark:from-yellow-400 dark:to-orange-500',
};

export function AchievementNotification({
  isVisible,
  achievement,
  language,
  onClose,
}: AchievementNotificationProps) {
  // 自動で閉じる（5秒後）
  useEffect(() => {
    if (!isVisible || !achievement) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible, achievement, onClose]);

  // Escapeキーで閉じる
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible || !achievement) {
    return null;
  }

  const gradient = rarityGradients[achievement.rarity];
  const textColor = rarityTextColors[achievement.rarity];

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 通知モーダル */}
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 animate-scaleUp"
        role="alert"
        aria-live="assertive"
      >
        <div className={`bg-gradient-to-r ${gradient} p-1 rounded-2xl shadow-2xl`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl px-8 py-6 text-center space-y-4 min-w-[280px]">
            {/* ヘッダー */}
            <h2 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${textColor}`}>
              {t('achievementUnlocked', language)}
            </h2>

            {/* アイコン */}
            <div className="text-6xl animate-bounce">
              {achievement.icon}
            </div>

            {/* 実績名 */}
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {achievement.name[language]}
            </h3>

            {/* 説明 */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {achievement.description[language]}
            </p>

            {/* 獲得称号 */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('achievementTitleObtained', language)}
              </p>
              <p className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${textColor}`}>
                「{achievement.title[language]}」
              </p>
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className={`mt-2 px-6 py-2 bg-gradient-to-r ${gradient} text-white font-semibold rounded-lg hover:opacity-90 transition-all transform hover:scale-105`}
            >
              {t('close', language)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
