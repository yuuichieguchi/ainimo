'use client';

import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { usePersistence } from '@/hooks/usePersistence';
import { useDarkMode } from '@/hooks/useDarkMode';
import { AinimoPet } from './AinimoPet';
import { StatusPanel } from './StatusPanel';
import { ChatLog } from './ChatLog';
import { ActionButtons } from './ActionButtons';

export function GameContainer() {
  const { state, handleAction, handleChat, resetGame, loadState } = useGameState();
  const { clearSave } = usePersistence(state, (loadedState) => {
    loadState(loadedState);
  });
  const { theme, toggleTheme } = useDarkMode();

  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      handleChat(chatInput.trim());
      setChatInput('');
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset Ainimo? This will delete all progress.')) {
      await clearSave();
      resetGame();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Ainimo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Raise your AI from dumb to smart!
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <AinimoPet parameters={state.parameters} />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Chat with Ainimo
              </h3>
              <ChatLog messages={state.messages} />

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={500}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={state.parameters.energy < 20}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || state.parameters.energy < 20}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Actions
              </h3>
              <ActionButtons onAction={handleAction} energy={state.parameters.energy} />
            </div>
          </div>

          <div className="space-y-6">
            <StatusPanel parameters={state.parameters} />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Settings
              </h3>
              <div className="space-y-3">
                <button
                  onClick={toggleTheme}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  {theme === 'system' && '🌓 System'}
                  {theme === 'light' && '☀️ Light'}
                  {theme === 'dark' && '🌙 Dark'}
                </button>
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Reset Ainimo
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Made with ❤️ using Next.js, TypeScript, and Tailwind CSS</p>
          <p className="mt-1">No external AI APIs used - all intelligence is simulated!</p>
        </footer>
      </div>
    </div>
  );
}
