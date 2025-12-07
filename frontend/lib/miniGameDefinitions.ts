import { IntelligenceTier } from '@/types/game';
import { MiniGameType, MiniGameConfig, TierDifficulty, MiniGameScore, MiniGameState } from '@/types/miniGame';

// ゲーム設定
export const MINI_GAME_CONFIGS: Record<MiniGameType, MiniGameConfig> = {
  memory: {
    type: 'memory',
    energyCost: 15,
    cooldownMs: 5 * 60 * 1000, // 5分
    baseXpReward: 30,
    baseCoinReward: 10,
    itemDropChance: 0.15,
    name: { en: 'Memory Match', ja: '神経衰弱' },
    description: { en: 'Match pairs of cards!', ja: 'カードのペアを見つけよう!' },
    icon: '🃏',
  },
  rhythm: {
    type: 'rhythm',
    energyCost: 15,
    cooldownMs: 5 * 60 * 1000,
    baseXpReward: 35,
    baseCoinReward: 12,
    itemDropChance: 0.18,
    name: { en: 'Rhythm Beat', ja: 'リズムビート' },
    description: { en: 'Hit the notes on beat!', ja: 'リズムに合わせてタップ!' },
    icon: '🎵',
  },
  puzzle: {
    type: 'puzzle',
    energyCost: 15,
    cooldownMs: 5 * 60 * 1000,
    baseXpReward: 40,
    baseCoinReward: 15,
    itemDropChance: 0.20,
    name: { en: 'Slide Puzzle', ja: 'スライドパズル' },
    description: { en: 'Solve the sliding puzzle!', ja: 'パズルを完成させよう!' },
    icon: '🧩',
  },
  quiz: {
    type: 'quiz',
    energyCost: 15,
    cooldownMs: 5 * 60 * 1000,
    baseXpReward: 25,
    baseCoinReward: 8,
    itemDropChance: 0.12,
    name: { en: 'Ainimo Quiz', ja: 'アイニモクイズ' },
    description: { en: 'Test your knowledge!', ja: '知識を試そう!' },
    icon: '❓',
  },
};

// ティアごとの難易度設定
export const TIER_DIFFICULTY: Record<IntelligenceTier, TierDifficulty> = {
  baby: {
    memory: { pairs: 4, timeLimit: 60 },
    rhythm: { noteCount: 8, bpm: 80 },
    puzzle: { gridSize: 3, timeLimit: 120 },
    quiz: { questionCount: 5, timePerQuestion: 15 },
  },
  child: {
    memory: { pairs: 6, timeLimit: 75 },
    rhythm: { noteCount: 12, bpm: 100 },
    puzzle: { gridSize: 3, timeLimit: 90 },
    quiz: { questionCount: 7, timePerQuestion: 12 },
  },
  teen: {
    memory: { pairs: 8, timeLimit: 90 },
    rhythm: { noteCount: 20, bpm: 120 },
    puzzle: { gridSize: 4, timeLimit: 120 },
    quiz: { questionCount: 8, timePerQuestion: 10 },
  },
  adult: {
    memory: { pairs: 12, timeLimit: 120 },
    rhythm: { noteCount: 30, bpm: 140 },
    puzzle: { gridSize: 4, timeLimit: 90 },
    quiz: { questionCount: 10, timePerQuestion: 8 },
  },
};

// 報酬倍率（ティア別）
export const TIER_REWARD_MULTIPLIER: Record<IntelligenceTier, number> = {
  baby: 1.0,
  child: 1.2,
  teen: 1.5,
  adult: 2.0,
};

// スコア閾値（成功判定用）
export const SCORE_THRESHOLDS = {
  memory: {
    perfect: 100,
    good: 70,
    clear: 50,
  },
  rhythm: {
    perfect: 95,
    good: 80,
    clear: 60,
  },
  puzzle: {
    perfect: 100,
    good: 80,
    clear: 60,
  },
  quiz: {
    perfect: 100,
    good: 80,
    clear: 60,
  },
};

// メモリーゲームのシンボル
export const MEMORY_SYMBOLS = [
  '🌟', '🎀', '🎈', '🌈', '🍎', '🍰',
  '🌸', '🎵', '💎', '🦋', '🌙', '⭐',
  '🎁', '🍭', '🌺', '🐱',
];

// リズムゲームのレーン数
export const RHYTHM_LANES = 4;

// 初期スコア状態
export function getInitialMiniGameScore(): MiniGameScore {
  return {
    highScore: 0,
    totalPlays: 0,
    totalWins: 0,
  };
}

// 初期ミニゲーム状態
export function getInitialMiniGameState(): MiniGameState {
  return {
    scores: {
      memory: getInitialMiniGameScore(),
      rhythm: getInitialMiniGameScore(),
      puzzle: getInitialMiniGameScore(),
      quiz: getInitialMiniGameScore(),
    },
    lastPlayedAt: {
      memory: 0,
      rhythm: 0,
      puzzle: 0,
      quiz: 0,
    },
  };
}

// ゲームタイプ一覧
export const MINI_GAME_TYPES: MiniGameType[] = ['memory', 'rhythm', 'puzzle', 'quiz'];
