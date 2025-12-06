'use client';

import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { usePersistence } from '@/hooks/usePersistence';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useLanguage } from '@/hooks/useLanguage';
import { useLevelUpNotification } from '@/hooks/useLevelUpNotification';
import { t } from '@/lib/i18n';
import { AinimoPet } from './AinimoPet';
import { StatusPanel } from './StatusPanel';
import { ChatLog } from './ChatLog';
import { ActionButtons } from './ActionButtons';
import { LevelUpNotification } from './LevelUpNotification';

export function GameContainer() {
  const { language, toggleLanguage, mounted } = useLanguage();
  const { state, handleAction, handleChat, resetGame, loadState } = useGameState();
  const { clearSave } = usePersistence(state, (loadedState) => {
    loadState(loadedState);
  });
  const { theme, toggleTheme } = useDarkMode();
  const { notificationState, isLevelUpRecent, hideNotification } = useLevelUpNotification(state.parameters.level);

  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      handleChat(chatInput.trim(), language);
      setChatInput('');
    }
  };

  const handleReset = async () => {
    if (confirm(t('resetConfirm', language))) {
      await clearSave();
      resetGame();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center">
          <div className="mb-4 flex justify-center">
            {/* Light mode logo */}
            <img
              src="/logo_light_mode.png"
              alt="Ainimo"
              className="h-20 w-auto dark:hidden"
              style={{ imageRendering: 'crisp-edges' }}
            />
            {/* Dark mode logo */}
            <img
              src="/logo_dark_mode.png"
              alt="Ainimo"
              className="h-20 w-auto hidden dark:block"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {t('appSubtitle', language)}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <AinimoPet parameters={state.parameters} language={language} currentActivity={state.currentActivity} />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                {t('chatWith', language)}
              </h3>
              <ChatLog messages={state.messages} language={language} />

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t('typeMessage', language)}
                  maxLength={500}
                  className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={state.parameters.energy < 20}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || state.parameters.energy < 20}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {t('send', language)}
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                {t('actions', language)}
              </h3>
              <ActionButtons onAction={handleAction} energy={state.parameters.energy} language={language} />
            </div>
          </div>

          <div className="space-y-6">
            <StatusPanel
              parameters={state.parameters}
              language={language}
              isLevelUpRecent={isLevelUpRecent}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                {t('settings', language)}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={toggleTheme}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  {theme === 'system' && t('themeSystem', language)}
                  {theme === 'light' && t('themeLight', language)}
                  {theme === 'dark' && t('themeDark', language)}
                </button>
                <button
                  onClick={toggleLanguage}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  {language === 'en' ? t('languageJa', language) : t('languageEn', language)}
                </button>
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  {t('resetAinimo', language)}
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t('footerMade', language)}</p>
          <p className="mt-1">{t('footerNoAI', language)}</p>
        </footer>
      </div>

      <LevelUpNotification
        isVisible={notificationState.isVisible}
        newLevel={notificationState.newLevel}
        language={language}
        onClose={hideNotification}
      />
    </div>
  );
}
