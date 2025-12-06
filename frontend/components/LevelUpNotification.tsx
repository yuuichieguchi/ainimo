'use client';

import { useEffect } from 'react';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface LevelUpNotificationProps {
  isVisible: boolean;
  newLevel: number;
  language: Language;
  onClose: () => void;
}

export function LevelUpNotification({
  isVisible,
  newLevel,
  language,
  onClose,
}: LevelUpNotificationProps) {
  // Escapeキーでモーダルを閉じる
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

  if (!isVisible) {
    return null;
  }

  // レベルメッセージをフォーマット
  const message = t('levelUpMessage', language).replace(/{level}/g, newLevel.toString());

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
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 p-1 rounded-2xl shadow-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl px-8 py-6 text-center space-y-4">
            {/* メインメッセージ */}
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              {t('levelUp', language)}
            </h2>

            {/* レベル表示 */}
            <div className="text-6xl font-black text-gray-800 dark:text-white">
              {newLevel}
            </div>

            {/* サブメッセージ */}
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {message}
            </p>

            <p className="text-md text-gray-600 dark:text-gray-400">
              {t('levelUpSubtitle', language)}
            </p>

            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              {t('close', language)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
