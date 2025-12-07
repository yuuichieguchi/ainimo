'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RhythmGameState } from '@/types/miniGame';
import { Language } from '@/hooks/useLanguage';
import { RHYTHM_LANES } from '@/lib/miniGameDefinitions';

interface RhythmGameProps {
  gameState: RhythmGameState;
  onBegin: () => void;
  onHitNote: (lane: number) => void;
  onMissNote: () => void;
  onComplete: () => void;
  language: Language;
}

const LANE_KEYS = ['A', 'S', 'D', 'F'];
const LANE_COLORS = [
  'from-pink-400 to-pink-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-yellow-400 to-yellow-600',
];

export function RhythmGame({
  gameState,
  onBegin,
  onHitNote,
  onMissNote,
  onComplete,
  language,
}: RhythmGameProps) {
  const [countdown, setCountdown] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // カウントダウン＆開始
  useEffect(() => {
    if (gameState.isPlaying) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onBegin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying, onBegin]);

  // ゲーム完了チェック
  useEffect(() => {
    if (gameState.isPlaying && gameState.currentNoteIndex >= gameState.notes.length) {
      onComplete();
    }
  }, [gameState.isPlaying, gameState.currentNoteIndex, gameState.notes.length, onComplete]);

  // ノート通過チェック（ミス判定）
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const interval = setInterval(() => {
      const currentNote = gameState.notes[gameState.currentNoteIndex];
      if (currentNote && currentNote.result === null) {
        const elapsedTime = Date.now() - gameState.startTime;
        if (elapsedTime > currentNote.targetTime + 200) {
          onMissNote();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, onMissNote]);

  // キーボード入力
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const laneIndex = LANE_KEYS.indexOf(key);
      if (laneIndex !== -1) {
        onHitNote(laneIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, onHitNote]);

  // レーンボタンクリック
  const handleLaneClick = useCallback(
    (lane: number) => {
      if (!gameState.isPlaying) return;
      onHitNote(lane);
    },
    [gameState.isPlaying, onHitNote]
  );

  // ノート位置計算
  const getNotePosition = (note: typeof gameState.notes[0]): number => {
    if (!gameState.isPlaying) return -100;
    const elapsedTime = Date.now() - gameState.startTime;
    const timeToHit = note.targetTime - elapsedTime;
    // 2秒で画面全体を移動
    const position = 100 - (timeToHit / 2000) * 100;
    return position;
  };

  // 現在の次のノートのレーン
  const currentNote = gameState.notes[gameState.currentNoteIndex];

  return (
    <div className="p-4" ref={containerRef}>
      {/* ステータスバー */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <div className="flex gap-4">
          <span className="text-gray-600 dark:text-gray-300">
            ✨ {gameState.score}
          </span>
          <span className="text-orange-500 font-bold">
            🔥 {gameState.combo}x
          </span>
        </div>
        <span className="text-gray-600 dark:text-gray-300">
          {gameState.hits}/{gameState.notes.length}
        </span>
      </div>

      {/* カウントダウン */}
      {!gameState.isPlaying && countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
          <span className="text-6xl font-bold text-white animate-ping">
            {countdown}
          </span>
        </div>
      )}

      {/* ゲームエリア */}
      <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
        {/* レーン */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: RHYTHM_LANES }).map((_, lane) => (
            <div
              key={lane}
              className="flex-1 border-r border-gray-700 relative"
            >
              {/* ノート */}
              {gameState.isPlaying &&
                gameState.notes
                  .filter((note) => note.lane === lane && note.result === null)
                  .map((note) => {
                    const position = getNotePosition(note);
                    if (position < -10 || position > 110) return null;

                    return (
                      <div
                        key={note.id}
                        className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-8 rounded-md bg-gradient-to-b ${LANE_COLORS[lane]} shadow-lg`}
                        style={{
                          top: `${position}%`,
                          transition: 'none',
                        }}
                      />
                    );
                  })}
            </div>
          ))}
        </div>

        {/* ヒットライン */}
        <div className="absolute bottom-12 left-0 right-0 h-1 bg-white/50" />

        {/* レーンボタン */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {Array.from({ length: RHYTHM_LANES }).map((_, lane) => (
            <button
              key={lane}
              onClick={() => handleLaneClick(lane)}
              className={`flex-1 h-12 bg-gradient-to-b ${LANE_COLORS[lane]} opacity-80 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-lg border-r border-gray-800`}
            >
              {LANE_KEYS[lane]}
            </button>
          ))}
        </div>
      </div>

      {/* 操作説明 */}
      <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        {language === 'ja'
          ? `キーボード (${LANE_KEYS.join(', ')}) またはボタンをタップ`
          : `Press ${LANE_KEYS.join(', ')} keys or tap buttons`}
      </div>
    </div>
  );
}
