import { IntelligenceTier } from './game';

// ミニゲームタイプ
export type MiniGameType = 'memory' | 'rhythm' | 'puzzle' | 'quiz';

// ゲーム設定
export interface MiniGameConfig {
  type: MiniGameType;
  energyCost: number;
  cooldownMs: number;
  baseXpReward: number;
  baseCoinReward: number;
  itemDropChance: number;
  name: {
    en: string;
    ja: string;
  };
  description: {
    en: string;
    ja: string;
  };
  icon: string;
}

// ティアごとの難易度設定
export interface TierDifficulty {
  memory: { pairs: number; timeLimit: number };
  rhythm: { noteCount: number; bpm: number };
  puzzle: { gridSize: number; timeLimit: number };
  quiz: { questionCount: number; timePerQuestion: number };
}

// ゲームスコア（永続化用）
export interface MiniGameScore {
  highScore: number;
  totalPlays: number;
  totalWins: number;
}

// ミニゲーム状態（永続化用）
export interface MiniGameState {
  scores: Record<MiniGameType, MiniGameScore>;
  lastPlayedAt: Record<MiniGameType, number>;
}

// ゲーム結果
export interface GameResult {
  success: boolean;
  score: number;
  maxScore: number;
  xpEarned: number;
  coinsEarned: number;
  itemDropped: string | null;
  newHighScore: boolean;
}

// メモリーゲーム用
export interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryGameState {
  cards: MemoryCard[];
  flippedIndices: number[];
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  startTime: number;
  timeLimit: number;
  isComplete: boolean;
}

// リズムゲーム用
export type NoteResult = 'marvelous' | 'excellent' | 'good' | 'fair' | 'miss' | null;

export interface RhythmNote {
  id: number;
  lane: number;
  targetTime: number;
  hitTime: number | null;
  result: NoteResult;
}

export interface RhythmGameState {
  notes: RhythmNote[];
  currentNoteIndex: number;
  hits: number;
  misses: number;
  combo: number;
  maxCombo: number;
  score: number;
  isPlaying: boolean;
  startTime: number;
}

// パズルゲーム用
export interface PuzzleGameState {
  tiles: number[];
  gridSize: number;
  moves: number;
  startTime: number;
  timeLimit: number;
  isComplete: boolean;
}

// クイズゲーム用
export interface QuizQuestion {
  id: string;
  question: { en: string; ja: string };
  options: { en: string; ja: string }[];
  correctIndex: number;
  category: 'stats' | 'history' | 'trivia';
}

export interface QuizGameState {
  questions: QuizQuestion[];
  currentIndex: number;
  correctAnswers: number;
  answers: number[];
  startTime: number;
  questionStartTime: number;
  timePerQuestion: number;
  isComplete: boolean;
}

// ゲーム開始可能チェック結果
export interface CanPlayResult {
  canPlay: boolean;
  reason?: 'cooldown' | 'energy' | 'none';
  cooldownRemaining?: number;
  energyRequired?: number;
}

// ゲームセッション（アクティブなゲーム）
export type ActiveGameState =
  | { type: 'memory'; state: MemoryGameState }
  | { type: 'rhythm'; state: RhythmGameState }
  | { type: 'puzzle'; state: PuzzleGameState }
  | { type: 'quiz'; state: QuizGameState };
