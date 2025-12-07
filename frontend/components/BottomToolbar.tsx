'use client';

import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface BottomToolbarProps {
  onActionsClick: () => void;
  onMiniGamesClick: () => void;
  onAchievementsClick: () => void;
  onSettingsClick: () => void;
  energy: number;
  unlockedCount: number;
  totalCount: number;
  language: Language;
}

export function BottomToolbar({
  onActionsClick,
  onMiniGamesClick,
  onAchievementsClick,
  onSettingsClick,
  energy,
  unlockedCount,
  totalCount,
  language,
}: BottomToolbarProps) {
  const toolbarItems = [
    {
      id: 'actions',
      icon: '📚',
      label: t('actions', language),
      ariaLabel: t('actions', language),
      onClick: onActionsClick,
      badge: null,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    },
    {
      id: 'miniGames',
      icon: '🎮',
      label: t('miniGames', language),
      ariaLabel: t('miniGames', language),
      onClick: onMiniGamesClick,
      badge: `⚡${energy}`,
      color: 'from-green-500 to-teal-500',
      hoverColor: 'hover:from-green-600 hover:to-teal-600',
    },
    {
      id: 'achievements',
      icon: '🏆',
      label: t('achievements', language),
      ariaLabel: t('achievements', language),
      onClick: onAchievementsClick,
      badge: `${unlockedCount}/${totalCount}`,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: null,
      ariaLabel: t('settings', language),
      onClick: onSettingsClick,
      badge: null,
      color: null,
      hoverColor: null,
    },
  ];

  return (
    <>
      {/* モバイル: 固定フッター */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="grid grid-cols-4 gap-1 py-2 px-2">
          {toolbarItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              aria-label={item.ariaLabel}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all min-h-[60px] ${
                item.color
                  ? `bg-gradient-to-r ${item.color} ${item.hoverColor} text-white shadow-md`
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label && (
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              )}
              {item.badge && (
                <span className={`text-[10px] ${item.color ? 'opacity-80' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* デスクトップ: セクションとして表示 */}
      <div className="hidden md:flex justify-center items-center gap-4">
          {toolbarItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              aria-label={item.ariaLabel}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all hover:scale-105 ${
                item.color
                  ? `bg-gradient-to-r ${item.color} ${item.hoverColor} text-white shadow-md`
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label && (
                <span className="font-bold">
                  {item.label}
                </span>
              )}
              {item.badge && (
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  item.color ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
      </div>

      {/* モバイル用のスペーサー（固定フッターの高さ分） */}
      <div className="md:hidden h-20" />
    </>
  );
}
