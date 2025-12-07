'use client';

import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: 'system' | 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onReset: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  language,
  theme,
  onToggleTheme,
  onToggleLanguage,
  onReset,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span>⚙️</span>
              {t('settings', language)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-3">
          <button
            onClick={onToggleTheme}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>{theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}</span>
              {t('themeLabel', language)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {theme === 'system' && t('themeSystem', language)}
              {theme === 'light' && t('themeLight', language)}
              {theme === 'dark' && t('themeDark', language)}
            </span>
          </button>

          <button
            onClick={onToggleLanguage}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>🌐</span>
              {t('languageLabel', language)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'en' ? 'English' : '日本語'}
            </span>
          </button>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onReset}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>🗑️</span>
              {t('resetAinimo', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
