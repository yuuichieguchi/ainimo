'use client';

import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

// 数値を短縮表示 (1000 → 1K, 10000 → 10K)
function formatCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return num.toString();
}

interface BottomToolbarProps {
  onActionsClick: () => void;
  onMiniGamesClick: () => void;
  onShopClick: () => void;
  onInventoryClick: () => void;
  onAchievementsClick: () => void;
  onSettingsClick: () => void;
  energy: number;
  coins: number;
  unlockedCount: number;
  totalCount: number;
  language: Language;
}

export function BottomToolbar({
  onActionsClick,
  onMiniGamesClick,
  onShopClick,
  onInventoryClick,
  onAchievementsClick,
  onSettingsClick,
  energy,
  coins,
  unlockedCount,
  totalCount,
  language,
}: BottomToolbarProps) {
  const toolbarItems = [
    {
      id: 'actions',
      icon: '🎪',
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
      id: 'shop',
      icon: '🛒',
      label: t('shop', language),
      ariaLabel: t('shop', language),
      onClick: onShopClick,
      badge: `🪙${formatCompact(coins)}`,
      color: 'from-yellow-500 to-orange-500',
      hoverColor: 'hover:from-yellow-600 hover:to-orange-600',
    },
    {
      id: 'inventory',
      icon: '🎒',
      label: t('inventory', language),
      ariaLabel: t('inventory', language),
      onClick: onInventoryClick,
      badge: null,
      color: 'from-pink-500 to-rose-500',
      hoverColor: 'hover:from-pink-600 hover:to-rose-600',
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
      label: t('settings', language),
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
        <div className="grid grid-cols-6 gap-1 py-2 px-2">
          {toolbarItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              aria-label={item.ariaLabel}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-all ${
                item.color
                  ? `bg-gradient-to-r ${item.color} ${item.hoverColor} text-white shadow-md`
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.badge && (
                <span className={`text-[10px] ${item.color ? 'opacity-80' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* デスクトップ: セクションとして表示（グリッド全体を横断） */}
      <div className="hidden md:grid grid-cols-6 gap-2">
          {toolbarItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              aria-label={item.ariaLabel}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all hover:scale-105 ${
                item.color
                  ? `bg-gradient-to-r ${item.color} ${item.hoverColor} text-white shadow-md`
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-lg">{item.icon}</span>
                {item.label && (
                  <span className="font-bold text-xs">
                    {item.label}
                  </span>
                )}
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1 py-0.5 rounded-full whitespace-nowrap ${
                  item.color ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
      </div>

      {/* モバイル用のスペーサー（固定フッターの高さ分） */}
      <div className="md:hidden h-16" />
    </>
  );
}
