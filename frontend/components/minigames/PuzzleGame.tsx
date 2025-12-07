'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { PuzzleGameState } from '@/types/miniGame';
import { Language } from '@/hooks/useLanguage';

interface PuzzleGameProps {
  gameState: PuzzleGameState;
  onMoveTile: (index: number) => void;
  onComplete: () => void;
  language: Language;
}

export function PuzzleGame({
  gameState,
  onMoveTile,
  onComplete,
  language,
}: PuzzleGameProps) {
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

  const handleTileClick = useCallback(
    (index: number) => {
      if (gameState.tiles[index] === 0) return;
      onMoveTile(index);
    },
    [gameState.tiles, onMoveTile]
  );

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // タイルが正しい位置にあるかチェック
  const isCorrectPosition = (index: number): boolean => {
    const tile = gameState.tiles[index];
    if (tile === 0) return index === gameState.tiles.length - 1;
    return tile === index + 1;
  };

  const blankIndex = gameState.tiles.indexOf(0);
  const blankRow = Math.floor(blankIndex / gameState.gridSize);
  const blankCol = blankIndex % gameState.gridSize;

  // 隣接チェック
  const isAdjacent = (index: number): boolean => {
    const row = Math.floor(index / gameState.gridSize);
    const col = index % gameState.gridSize;
    return (
      (Math.abs(row - blankRow) === 1 && col === blankCol) ||
      (Math.abs(col - blankCol) === 1 && row === blankRow)
    );
  };

  return (
    <div className="p-4">
      {/* ステータスバー */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-gray-600 dark:text-gray-300">
          👆 {gameState.moves} moves
        </span>
        <span
          className={`font-bold ${timeRemaining < 15000 ? 'text-red-500 animate-pulse' : 'text-gray-800 dark:text-white'}`}
        >
          ⏱️ {formatTime(timeRemaining)}
        </span>
      </div>

      {/* パズルグリッド */}
      <div
        className="grid gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
          maxWidth: `${gameState.gridSize * 80}px`,
        }}
      >
        {gameState.tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            disabled={tile === 0 || !isAdjacent(index)}
            className={`
              aspect-square rounded-md transition-all duration-150 transform
              flex items-center justify-center text-2xl font-bold
              ${tile === 0
                ? 'bg-transparent'
                : isCorrectPosition(index)
                  ? 'bg-green-400 dark:bg-green-600 text-white'
                  : isAdjacent(index)
                    ? 'bg-blue-500 dark:bg-blue-600 text-white hover:scale-105 cursor-pointer shadow-md'
                    : 'bg-blue-400 dark:bg-blue-500 text-white opacity-80'
              }
            `}
          >
            {tile !== 0 && tile}
          </button>
        ))}
      </div>

      {/* ヒント */}
      <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        {language === 'ja'
          ? '隣接するタイルをタップして動かそう'
          : 'Tap adjacent tiles to move them'}
      </div>
    </div>
  );
}
