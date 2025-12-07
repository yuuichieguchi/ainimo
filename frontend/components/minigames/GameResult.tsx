'use client';

import { GameResult as GameResultType } from '@/types/miniGame';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { getItemById } from '@/lib/itemDefinitions';
import { RARITY_COLORS } from '@/types/item';

interface GameResultProps {
  result: GameResultType;
  onPlayAgain: () => void;
  onClose: () => void;
  language: Language;
}

export function GameResult({ result, onPlayAgain, onClose, language }: GameResultProps) {
  const droppedItem = result.itemDropped ? getItemById(result.itemDropped) : null;

  return (
    <div className="text-center p-6">
      {/* 結果アイコン */}
      <div className="text-6xl mb-4">
        {result.success ? '🎉' : '😢'}
      </div>

      {/* 結果メッセージ */}
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
        {result.success ? t('miniGameSuccess', language) : t('miniGameFailed', language)}
      </h2>

      {/* ハイスコア更新 */}
      {result.newHighScore && (
        <div className="text-lg text-yellow-500 font-bold mb-4 animate-pulse">
          🏆 {t('miniGameNewHighScore', language)}
        </div>
      )}

      {/* スコア */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <div className="text-3xl font-bold text-gray-800 dark:text-white">
          {result.score} / {result.maxScore}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('miniGameScore', language)}
        </div>
      </div>

      {/* 報酬 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            +{result.xpEarned}
          </div>
          <div className="text-xs text-blue-500 dark:text-blue-400">
            {t('miniGameXpEarned', language)}
          </div>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            +{result.coinsEarned}
          </div>
          <div className="text-xs text-yellow-500 dark:text-yellow-400">
            {t('miniGameCoinsEarned', language)}
          </div>
        </div>
      </div>

      {/* アイテムドロップ */}
      {droppedItem && (
        <div
          className="mb-4 p-4 rounded-lg border-2 animate-bounce"
          style={{ borderColor: RARITY_COLORS[droppedItem.rarity] }}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {t('miniGameItemDropped', language)}
          </div>
          <div className="text-3xl mb-1">{droppedItem.icon}</div>
          <div
            className="font-bold"
            style={{ color: RARITY_COLORS[droppedItem.rarity] }}
          >
            {droppedItem.name[language]}
          </div>
        </div>
      )}

      {/* ボタン */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onPlayAgain}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          {t('miniGamePlayAgain', language)}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {t('close', language)}
        </button>
      </div>
    </div>
  );
}
