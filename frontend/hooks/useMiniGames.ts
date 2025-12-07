'use client';

import { useState, useCallback, useMemo } from 'react';
import { IntelligenceTier } from '@/types/game';
import { PersonalityState } from '@/types/personality';
import {
  MiniGameType,
  MiniGameState,
  ActiveGameState,
  GameResult,
  CanPlayResult,
  MemoryGameState,
  RhythmGameState,
  PuzzleGameState,
  QuizGameState,
} from '@/types/miniGame';
import {
  canPlayGame,
  initializeMemoryGame,
  initializeRhythmGame,
  initializePuzzleGame,
  initializeQuizGame,
  flipMemoryCard,
  resetFlippedCards,
  calculateMemoryScore,
  startRhythmGame,
  hitRhythmNote,
  missRhythmNote,
  calculateRhythmScore,
  movePuzzleTile,
  calculatePuzzleScore,
  answerQuizQuestion,
  calculateQuizScore,
  createGameResult,
  updateMiniGameState,
} from '@/lib/miniGameEngine';
import { getInitialMiniGameState, MINI_GAME_CONFIGS } from '@/lib/miniGameDefinitions';

interface UseMiniGamesReturn {
  // 状態
  miniGameState: MiniGameState;
  activeGame: ActiveGameState | null;
  isPlaying: boolean;

  // ゲーム管理
  canPlay: (gameType: MiniGameType, energy: number) => CanPlayResult;
  startGame: (gameType: MiniGameType, tier: IntelligenceTier) => boolean;
  endGame: (tier: IntelligenceTier, personalityState?: PersonalityState) => GameResult | null;
  cancelGame: () => void;

  // メモリーゲーム
  flipCard: (index: number) => void;
  resetCards: () => void;

  // リズムゲーム
  beginRhythm: () => void;
  hitNote: (lane: number) => void;
  missNote: () => void;

  // パズルゲーム
  moveTile: (index: number) => void;

  // クイズゲーム
  answerQuestion: (index: number) => void;

  // クエリ
  getCooldownRemaining: (gameType: MiniGameType) => number;
  getEnergyCost: (gameType: MiniGameType) => number;

  // 永続化
  loadMiniGameState: (state: MiniGameState) => void;
  resetMiniGames: () => void;
}

export function useMiniGames(): UseMiniGamesReturn {
  const [miniGameState, setMiniGameState] = useState<MiniGameState>(getInitialMiniGameState);
  const [activeGame, setActiveGame] = useState<ActiveGameState | null>(null);

  const isPlaying = useMemo(() => activeGame !== null, [activeGame]);

  // ゲームプレイ可能チェック
  const canPlay = useCallback(
    (gameType: MiniGameType, energy: number): CanPlayResult => {
      return canPlayGame(gameType, energy, miniGameState.lastPlayedAt[gameType]);
    },
    [miniGameState.lastPlayedAt]
  );

  // ゲーム開始
  const startGame = useCallback(
    (gameType: MiniGameType, tier: IntelligenceTier): boolean => {
      if (activeGame !== null) return false;

      let gameState: ActiveGameState;

      switch (gameType) {
        case 'memory':
          gameState = { type: 'memory', state: initializeMemoryGame(tier) };
          break;
        case 'rhythm':
          gameState = { type: 'rhythm', state: initializeRhythmGame(tier) };
          break;
        case 'puzzle':
          gameState = { type: 'puzzle', state: initializePuzzleGame(tier) };
          break;
        case 'quiz':
          gameState = { type: 'quiz', state: initializeQuizGame(tier) };
          break;
        default:
          return false;
      }

      setActiveGame(gameState);
      return true;
    },
    [activeGame]
  );

  // ゲーム終了
  const endGame = useCallback(
    (tier: IntelligenceTier, personalityState?: PersonalityState): GameResult | null => {
      if (!activeGame) return null;

      let score: number;

      switch (activeGame.type) {
        case 'memory':
          score = calculateMemoryScore(activeGame.state);
          break;
        case 'rhythm':
          score = calculateRhythmScore(activeGame.state);
          break;
        case 'puzzle':
          score = calculatePuzzleScore(activeGame.state);
          break;
        case 'quiz':
          score = calculateQuizScore(activeGame.state);
          break;
        default:
          return null;
      }

      const previousHighScore = miniGameState.scores[activeGame.type].highScore;
      const result = createGameResult(activeGame.type, score, tier, previousHighScore, personalityState);

      setMiniGameState((prev) => updateMiniGameState(prev, activeGame.type, result));
      setActiveGame(null);

      return result;
    },
    [activeGame, miniGameState.scores]
  );

  // ゲームキャンセル
  const cancelGame = useCallback(() => {
    setActiveGame(null);
  }, []);

  // メモリーゲーム：カードをめくる
  const flipCard = useCallback((index: number) => {
    setActiveGame((prev) => {
      if (!prev || prev.type !== 'memory') return prev;
      return { type: 'memory', state: flipMemoryCard(prev.state, index) };
    });
  }, []);

  // メモリーゲーム：カードをリセット
  const resetCards = useCallback(() => {
    setActiveGame((prev) => {
      if (!prev || prev.type !== 'memory') return prev;
      return { type: 'memory', state: resetFlippedCards(prev.state) };
    });
  }, []);

  // リズムゲーム：開始
  const beginRhythm = useCallback(() => {
    setActiveGame((prev) => {
      if (!prev || prev.type !== 'rhythm') return prev;
      return { type: 'rhythm', state: startRhythmGame(prev.state) };
    });
  }, []);

  // リズムゲーム：ノートをヒット
  const hitNote = useCallback((lane: number) => {
    setActiveGame((prev) => {
      if (!prev || prev.type !== 'rhythm') return prev;
      return { type: 'rhythm', state: hitRhythmNote(prev.state, lane, Date.now()) };
    });
  }, []);

  // リズムゲーム：ノートをミス
  const missNote = useCallback(() => {
    setActiveGame((prev) => {
      if (!prev || prev.type !== 'rhythm') return prev;
      return { type: 'rhythm', state: missRhythmNote(prev.state) };
    });
  }, []);

  // パズルゲーム：タイルを動かす
  const moveTile = useCallback((index: number) => {
    setActiveGame((prev) => {
      if (!prev || prev.type !== 'puzzle') return prev;
      return { type: 'puzzle', state: movePuzzleTile(prev.state, index) };
    });
  }, []);

  // クイズゲーム：回答
  const answerQuestion = useCallback((index: number) => {
    setActiveGame((prev) => {
      if (!prev || prev.type !== 'quiz') return prev;
      return { type: 'quiz', state: answerQuizQuestion(prev.state, index) };
    });
  }, []);

  // クールダウン残り時間取得
  const getCooldownRemaining = useCallback(
    (gameType: MiniGameType): number => {
      const config = MINI_GAME_CONFIGS[gameType];
      const lastPlayed = miniGameState.lastPlayedAt[gameType];
      return Math.max(0, config.cooldownMs - (Date.now() - lastPlayed));
    },
    [miniGameState.lastPlayedAt]
  );

  // エネルギーコスト取得
  const getEnergyCost = useCallback((gameType: MiniGameType): number => {
    return MINI_GAME_CONFIGS[gameType].energyCost;
  }, []);

  // 状態ロード
  const loadMiniGameState = useCallback((state: MiniGameState) => {
    setMiniGameState(state);
  }, []);

  // リセット
  const resetMiniGames = useCallback(() => {
    setMiniGameState(getInitialMiniGameState());
    setActiveGame(null);
  }, []);

  return {
    miniGameState,
    activeGame,
    isPlaying,
    canPlay,
    startGame,
    endGame,
    cancelGame,
    flipCard,
    resetCards,
    beginRhythm,
    hitNote,
    missNote,
    moveTile,
    answerQuestion,
    getCooldownRemaining,
    getEnergyCost,
    loadMiniGameState,
    resetMiniGames,
  };
}
