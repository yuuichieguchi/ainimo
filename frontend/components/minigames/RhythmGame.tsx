'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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

// ヒットラインの位置（%）- ボタン(h-12=48px)の上、ゲームエリア(h-64=256px)
const HIT_LINE_POSITION = 81.25; // (256 - 48) / 256 * 100
// ノートの落下時間（ms）
const NOTE_TRAVEL_TIME = 2000;

// 判定結果の色マッピング
const JUDGEMENT_COLORS: Record<string, string> = {
  marvelous: '#FF00FF',
  excellent: '#FFD700',
  good: '#00FF00',
  fair: '#87CEEB',
  miss: '#FF4444',
};

// 判定結果の表示テキスト
const JUDGEMENT_TEXT: Record<string, string> = {
  marvelous: 'MARVELOUS!',
  excellent: 'EXCELLENT!',
  good: 'GOOD',
  fair: 'FAIR',
  miss: 'MISS',
};

export function RhythmGame({
  gameState,
  onBegin,
  onHitNote,
  onMissNote,
  onComplete,
  language,
}: RhythmGameProps) {
  const [countdown, setCountdown] = useState(3);
  const [currentTime, setCurrentTime] = useState(0);
  const [pressedLanes, setPressedLanes] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // カウントダウン＆開始
  useEffect(() => {
    if (gameState.isPlaying) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying]);

  // カウントダウン終了時にゲーム開始（setState外で呼び出し）
  useEffect(() => {
    if (countdown === 0 && !gameState.isPlaying) {
      onBegin();
    }
  }, [countdown, gameState.isPlaying, onBegin]);

  // requestAnimationFrameでノート位置を60fps更新
  useEffect(() => {
    if (!gameState.isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // ゲーム開始時に即座にcurrentTimeを設定（初回描画ずれ防止）
    setCurrentTime(Date.now());

    const updateTime = () => {
      setCurrentTime(Date.now());
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameState.isPlaying]);

  // ゲーム完了チェック
  useEffect(() => {
    if (gameState.isPlaying && gameState.currentNoteIndex >= gameState.notes.length) {
      onComplete();
    }
  }, [gameState.isPlaying, gameState.currentNoteIndex, gameState.notes.length, onComplete]);

  // ノート通過チェック（ミス判定）
  const { isPlaying, notes, currentNoteIndex, startTime } = gameState;
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const currentNote = notes[currentNoteIndex];
      if (currentNote && currentNote.result === null) {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > currentNote.targetTime + 200) {
          onMissNote();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, notes, currentNoteIndex, startTime, onMissNote]);

  // レーン押下エフェクト
  const triggerLanePress = useCallback((lane: number) => {
    setPressedLanes((prev) => new Set(prev).add(lane));
    setTimeout(() => {
      setPressedLanes((prev) => {
        const next = new Set(prev);
        next.delete(lane);
        return next;
      });
    }, 100);
  }, []);

  // キーボード入力
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const laneIndex = LANE_KEYS.indexOf(key);
      if (laneIndex !== -1) {
        triggerLanePress(laneIndex);
        onHitNote(laneIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, onHitNote, triggerLanePress]);

  // レーンボタンクリック
  const handleLaneClick = useCallback(
    (lane: number) => {
      if (!gameState.isPlaying) return;
      triggerLanePress(lane);
      onHitNote(lane);
    },
    [gameState.isPlaying, onHitNote, triggerLanePress]
  );

  // ノート位置計算（currentTimeを使用して60fpsで更新）
  // ノートがヒットラインに到達するタイミングでtargetTimeになるよう計算
  const getNotePosition = (note: typeof gameState.notes[0]): number => {
    if (!gameState.isPlaying || currentTime === 0) return -100;
    const elapsedTime = currentTime - gameState.startTime;
    const timeToHit = note.targetTime - elapsedTime;
    // timeToHit=0のときヒットライン位置(81.25%)、timeToHit=2000のとき0%
    const position = HIT_LINE_POSITION - (timeToHit / NOTE_TRAVEL_TIME) * HIT_LINE_POSITION;
    return position;
  };

  // 最新の判定結果を取得（useMemoでキャッシュ）
  const latestJudgement = useMemo(() => {
    for (let i = currentNoteIndex - 1; i >= 0; i--) {
      const note = notes[i];
      if (note.result !== null) {
        return { result: note.result, lane: note.lane };
      }
    }
    return null;
  }, [notes, currentNoteIndex]);

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

        {/* 判定表示 */}
        {latestJudgement && (
          <div
            key={currentNoteIndex}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
          >
            <div
              className="text-2xl font-bold animate-bounce"
              style={{
                color: JUDGEMENT_COLORS[latestJudgement.result],
                textShadow: '0 0 10px currentColor',
              }}
            >
              {JUDGEMENT_TEXT[latestJudgement.result]}
            </div>
            {gameState.combo > 1 && (
              <div className="text-xl font-bold text-orange-400 mt-1" style={{ textShadow: '0 0 8px #FF6B00' }}>
                {gameState.combo} COMBO!
              </div>
            )}
          </div>
        )}

        {/* レーンボタン */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {Array.from({ length: RHYTHM_LANES }).map((_, lane) => (
            <button
              key={lane}
              onClick={() => handleLaneClick(lane)}
              className={`flex-1 h-12 bg-gradient-to-b ${LANE_COLORS[lane]} transition-all duration-75 flex items-center justify-center text-white font-bold text-lg border-r border-gray-800 ${
                pressedLanes.has(lane)
                  ? 'opacity-100 scale-95 brightness-125'
                  : 'opacity-80 hover:opacity-100'
              }`}
              style={pressedLanes.has(lane) ? { boxShadow: '0 0 20px rgba(255,255,255,0.5) inset' } : undefined}
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
