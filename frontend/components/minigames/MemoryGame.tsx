'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MemoryGameState } from '@/types/miniGame';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface MemoryGameProps {
  gameState: MemoryGameState;
  onFlipCard: (index: number) => void;
  onResetCards: () => void;
  onComplete: () => void;
  language: Language;
}

export function MemoryGame({
  gameState,
  onFlipCard,
  onResetCards,
  onComplete,
  language,
}: MemoryGameProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    Math.max(0, gameState.timeLimit - (Date.now() - gameState.startTime))
  );
  const hasCompletedRef = useRef(false);

  // タイマー
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, gameState.timeLimit - (Date.now() - gameState.startTime));
      setTimeRemaining(remaining);

      if (remaining === 0 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.timeLimit, gameState.startTime, onComplete]);

  // ゲーム完了チェック
  useEffect(() => {
    if (gameState.isComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [gameState.isComplete, onComplete]);

  // 2枚めくった後のリセット
  useEffect(() => {
    if (gameState.flippedIndices.length === 2) {
      const timer = setTimeout(() => {
        onResetCards();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState.flippedIndices, onResetCards]);

  const handleCardClick = useCallback(
    (index: number) => {
      const card = gameState.cards[index];
      if (card.isFlipped || card.isMatched || gameState.flippedIndices.length >= 2) {
        return;
      }
      onFlipCard(index);
    },
    [gameState.cards, gameState.flippedIndices, onFlipCard]
  );

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // グリッドサイズを計算
  const totalCards = gameState.cards.length;
  const cols = totalCards <= 8 ? 4 : totalCards <= 12 ? 4 : 6;

  return (
    <div className="p-4">
      {/* ステータスバー */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <div className="flex gap-4">
          <span className="text-gray-600 dark:text-gray-300">
            ✅ {gameState.matchedPairs}/{gameState.totalPairs}
          </span>
          <span className="text-gray-600 dark:text-gray-300">
            👆 {gameState.moves}
          </span>
        </div>
        <span
          className={`font-bold ${timeRemaining < 10000 ? 'text-red-500 animate-pulse' : 'text-gray-800 dark:text-white'}`}
        >
          ⏱️ {formatTime(timeRemaining)}
        </span>
      </div>

      {/* カードグリッド */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {gameState.cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={card.isFlipped || card.isMatched}
            className={`
              aspect-square rounded-lg transition-all duration-300 transform
              ${card.isMatched
                ? 'bg-green-200 dark:bg-green-800 scale-95'
                : card.isFlipped
                  ? 'bg-white dark:bg-gray-600 rotate-y-180'
                  : 'bg-gradient-to-br from-blue-400 to-purple-500 hover:scale-105 cursor-pointer'
              }
              flex items-center justify-center text-2xl shadow-md
            `}
          >
            {(card.isFlipped || card.isMatched) ? card.symbol : '❓'}
          </button>
        ))}
      </div>
    </div>
  );
}
