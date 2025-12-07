import { IntelligenceTier } from '@/types/game';
import { PersonalityState } from '@/types/personality';
import {
  MiniGameType,
  CanPlayResult,
  GameResult,
  MemoryGameState,
  MemoryCard,
  RhythmGameState,
  RhythmNote,
  PuzzleGameState,
  QuizGameState,
  QuizQuestion,
  MiniGameState,
  MiniGameScore,
} from '@/types/miniGame';
import {
  MINI_GAME_CONFIGS,
  TIER_DIFFICULTY,
  TIER_REWARD_MULTIPLIER,
  SCORE_THRESHOLDS,
  MEMORY_SYMBOLS,
  RHYTHM_LANES,
  getInitialMiniGameScore,
} from './miniGameDefinitions';
import { ALL_ITEMS, getDroppableItems } from './itemDefinitions';

// ゲームプレイ可能チェック
export function canPlayGame(
  gameType: MiniGameType,
  energy: number,
  lastPlayedAt: number,
  currentTime: number = Date.now()
): CanPlayResult {
  const config = MINI_GAME_CONFIGS[gameType];
  const cooldownRemaining = Math.max(0, config.cooldownMs - (currentTime - lastPlayedAt));

  if (cooldownRemaining > 0) {
    return {
      canPlay: false,
      reason: 'cooldown',
      cooldownRemaining,
    };
  }

  if (energy < config.energyCost) {
    return {
      canPlay: false,
      reason: 'energy',
      energyRequired: config.energyCost,
    };
  }

  return { canPlay: true };
}

// シャッフル関数
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// メモリーゲーム初期化
export function initializeMemoryGame(tier: IntelligenceTier): MemoryGameState {
  const difficulty = TIER_DIFFICULTY[tier].memory;
  const symbols = shuffleArray(MEMORY_SYMBOLS).slice(0, difficulty.pairs);
  const cardSymbols = shuffleArray([...symbols, ...symbols]);

  const cards: MemoryCard[] = cardSymbols.map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false,
  }));

  return {
    cards,
    flippedIndices: [],
    matchedPairs: 0,
    totalPairs: difficulty.pairs,
    moves: 0,
    startTime: Date.now(),
    timeLimit: difficulty.timeLimit * 1000,
    isComplete: false,
  };
}

// メモリーゲーム：カードをめくる
export function flipMemoryCard(state: MemoryGameState, index: number): MemoryGameState {
  const card = state.cards[index];

  // 既にめくられているか、マッチ済みの場合は無視
  if (card.isFlipped || card.isMatched || state.flippedIndices.length >= 2) {
    return state;
  }

  const newCards = [...state.cards];
  newCards[index] = { ...card, isFlipped: true };
  const newFlippedIndices = [...state.flippedIndices, index];

  // 2枚めくった場合のマッチング判定
  if (newFlippedIndices.length === 2) {
    const [first, second] = newFlippedIndices;
    const firstCard = newCards[first];
    const secondCard = newCards[second];

    if (firstCard.symbol === secondCard.symbol) {
      newCards[first] = { ...firstCard, isMatched: true };
      newCards[second] = { ...secondCard, isMatched: true };
      const newMatchedPairs = state.matchedPairs + 1;
      const isComplete = newMatchedPairs === state.totalPairs;

      return {
        ...state,
        cards: newCards,
        flippedIndices: [],
        matchedPairs: newMatchedPairs,
        moves: state.moves + 1,
        isComplete,
      };
    }

    // マッチしない場合は、次のアクションでリセットされる
    return {
      ...state,
      cards: newCards,
      flippedIndices: newFlippedIndices,
      moves: state.moves + 1,
    };
  }

  return {
    ...state,
    cards: newCards,
    flippedIndices: newFlippedIndices,
  };
}

// メモリーゲーム：めくったカードをリセット
export function resetFlippedCards(state: MemoryGameState): MemoryGameState {
  if (state.flippedIndices.length !== 2) return state;

  const newCards = state.cards.map((card, index) => {
    if (state.flippedIndices.includes(index) && !card.isMatched) {
      return { ...card, isFlipped: false };
    }
    return card;
  });

  return {
    ...state,
    cards: newCards,
    flippedIndices: [],
  };
}

// メモリーゲーム：スコア計算
export function calculateMemoryScore(state: MemoryGameState): number {
  if (!state.isComplete) return 0;

  const elapsedTime = (Date.now() - state.startTime) / 1000;
  const timeBonus = Math.max(0, (state.timeLimit / 1000 - elapsedTime) / (state.timeLimit / 1000)) * 30;
  const moveEfficiency = Math.max(0, 1 - (state.moves - state.totalPairs) / (state.totalPairs * 2)) * 70;

  return Math.round(timeBonus + moveEfficiency);
}

// リズムゲーム初期化
export function initializeRhythmGame(tier: IntelligenceTier): RhythmGameState {
  const difficulty = TIER_DIFFICULTY[tier].rhythm;
  const beatInterval = 60000 / difficulty.bpm;

  const notes: RhythmNote[] = Array.from({ length: difficulty.noteCount }, (_, i) => ({
    id: i,
    lane: Math.floor(Math.random() * RHYTHM_LANES),
    targetTime: (i + 2) * beatInterval, // 最初の2拍は準備時間
    hitTime: null,
    result: null,
  }));

  return {
    notes,
    currentNoteIndex: 0,
    hits: 0,
    misses: 0,
    combo: 0,
    maxCombo: 0,
    score: 0,
    isPlaying: false,
    startTime: 0,
  };
}

// リズムゲーム：開始
export function startRhythmGame(state: RhythmGameState): RhythmGameState {
  return {
    ...state,
    isPlaying: true,
    startTime: Date.now(),
  };
}

// リズムゲーム：ノートヒット
export function hitRhythmNote(state: RhythmGameState, lane: number, hitTime: number): RhythmGameState {
  if (!state.isPlaying) return state;

  const elapsedTime = hitTime - state.startTime;
  const currentNote = state.notes[state.currentNoteIndex];

  if (!currentNote || currentNote.result !== null) return state;

  // レーンチェック
  if (currentNote.lane !== lane) return state;

  const timingDiff = Math.abs(elapsedTime - currentNote.targetTime);
  let result: 'marvelous' | 'excellent' | 'good' | 'fair' | 'miss';
  let scoreAdd = 0;

  // 判定ウィンドウ: Marvelous(±30ms), Excellent(±60ms), Good(±100ms), Fair(±150ms), Miss(>150ms)
  if (timingDiff <= 30) {
    result = 'marvelous';
    scoreAdd = 100;
  } else if (timingDiff <= 60) {
    result = 'excellent';
    scoreAdd = 80;
  } else if (timingDiff <= 100) {
    result = 'good';
    scoreAdd = 50;
  } else if (timingDiff <= 150) {
    result = 'fair';
    scoreAdd = 20;
  } else {
    result = 'miss';
    scoreAdd = 0;
  }

  const newNotes = [...state.notes];
  newNotes[state.currentNoteIndex] = {
    ...currentNote,
    hitTime: elapsedTime,
    result,
  };

  const newCombo = result !== 'miss' ? state.combo + 1 : 0;
  const comboBonus = Math.floor(newCombo / 5) * 10;

  return {
    ...state,
    notes: newNotes,
    currentNoteIndex: state.currentNoteIndex + 1,
    hits: result !== 'miss' ? state.hits + 1 : state.hits,
    misses: result === 'miss' ? state.misses + 1 : state.misses,
    combo: newCombo,
    maxCombo: Math.max(state.maxCombo, newCombo),
    score: state.score + scoreAdd + comboBonus,
  };
}

// リズムゲーム：ノートをミスとしてマーク
export function missRhythmNote(state: RhythmGameState): RhythmGameState {
  if (!state.isPlaying || state.currentNoteIndex >= state.notes.length) return state;

  const newNotes = [...state.notes];
  newNotes[state.currentNoteIndex] = {
    ...newNotes[state.currentNoteIndex],
    result: 'miss',
  };

  return {
    ...state,
    notes: newNotes,
    currentNoteIndex: state.currentNoteIndex + 1,
    misses: state.misses + 1,
    combo: 0,
  };
}

// リズムゲーム：スコア計算（100点満点に正規化）
export function calculateRhythmScore(state: RhythmGameState): number {
  const totalNotes = state.notes.length;
  if (totalNotes === 0) return 0;

  const maxPossibleScore = totalNotes * 100;
  return Math.round((state.score / maxPossibleScore) * 100);
}

// パズルゲーム初期化
export function initializePuzzleGame(tier: IntelligenceTier): PuzzleGameState {
  const difficulty = TIER_DIFFICULTY[tier].puzzle;
  const gridSize = difficulty.gridSize;
  const totalTiles = gridSize * gridSize;

  // 解ける状態を保証するシャッフル
  let tiles = Array.from({ length: totalTiles }, (_, i) => i);
  do {
    tiles = shuffleArray(tiles);
  } while (!isSolvable(tiles, gridSize) || isSolved(tiles));

  return {
    tiles,
    gridSize,
    moves: 0,
    startTime: Date.now(),
    timeLimit: difficulty.timeLimit * 1000,
    isComplete: false,
  };
}

// パズルが解けるかチェック
function isSolvable(tiles: number[], gridSize: number): boolean {
  let inversions = 0;
  const n = tiles.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (tiles[i] !== 0 && tiles[j] !== 0 && tiles[i] > tiles[j]) {
        inversions++;
      }
    }
  }

  if (gridSize % 2 === 1) {
    return inversions % 2 === 0;
  } else {
    const blankRow = Math.floor(tiles.indexOf(0) / gridSize);
    const blankFromBottom = gridSize - blankRow;
    return (inversions + blankFromBottom) % 2 === 1;
  }
}

// パズルが完成しているかチェック
function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[tiles.length - 1] === 0;
}

// パズルゲーム：タイルを動かす
export function movePuzzleTile(state: PuzzleGameState, tileIndex: number): PuzzleGameState {
  if (state.isComplete) return state;

  const blankIndex = state.tiles.indexOf(0);
  const gridSize = state.gridSize;

  const tileRow = Math.floor(tileIndex / gridSize);
  const tileCol = tileIndex % gridSize;
  const blankRow = Math.floor(blankIndex / gridSize);
  const blankCol = blankIndex % gridSize;

  // 隣接チェック
  const isAdjacent =
    (Math.abs(tileRow - blankRow) === 1 && tileCol === blankCol) ||
    (Math.abs(tileCol - blankCol) === 1 && tileRow === blankRow);

  if (!isAdjacent) return state;

  const newTiles = [...state.tiles];
  [newTiles[tileIndex], newTiles[blankIndex]] = [newTiles[blankIndex], newTiles[tileIndex]];

  const isComplete = isSolved(newTiles);

  return {
    ...state,
    tiles: newTiles,
    moves: state.moves + 1,
    isComplete,
  };
}

// パズルゲーム：スコア計算
export function calculatePuzzleScore(state: PuzzleGameState): number {
  if (!state.isComplete) return 0;

  const elapsedTime = (Date.now() - state.startTime) / 1000;
  const timeLimit = state.timeLimit / 1000;
  const optimalMoves = state.gridSize * state.gridSize * 2;

  const timeBonus = Math.max(0, (timeLimit - elapsedTime) / timeLimit) * 50;
  const moveEfficiency = Math.max(0, 1 - (state.moves - optimalMoves) / (optimalMoves * 2)) * 50;

  return Math.round(timeBonus + moveEfficiency);
}

// クイズ問題生成
export function generateQuizQuestions(tier: IntelligenceTier): QuizQuestion[] {
  const difficulty = TIER_DIFFICULTY[tier].quiz;
  const allQuestions = getStaticQuizQuestions();

  return shuffleArray(allQuestions).slice(0, difficulty.questionCount);
}

// 静的クイズ問題
function getStaticQuizQuestions(): QuizQuestion[] {
  return [
    {
      id: 'q1',
      question: { en: 'What action increases intelligence the most?', ja: '知性が最も上がるアクションは?' },
      options: [
        { en: 'Study', ja: '勉強' },
        { en: 'Play', ja: '遊ぶ' },
        { en: 'Rest', ja: '休憩' },
        { en: 'Chat', ja: 'チャット' },
      ],
      correctIndex: 0,
      category: 'trivia',
    },
    {
      id: 'q2',
      question: { en: 'What happens when energy is 0?', ja: 'エネルギーが0になるとどうなる?' },
      options: [
        { en: "Can't do actions", ja: 'アクションができない' },
        { en: 'Game resets', ja: 'ゲームリセット' },
        { en: 'Mood drops', ja: '気分が下がる' },
        { en: 'Nothing', ja: '何も起きない' },
      ],
      correctIndex: 0,
      category: 'trivia',
    },
    {
      id: 'q3',
      question: { en: 'Which tier comes after child?', ja: '子供の次のティアは?' },
      options: [
        { en: 'Baby', ja: '赤ちゃん' },
        { en: 'Teen', ja: 'ティーン' },
        { en: 'Adult', ja: '大人' },
        { en: 'Elder', ja: '長老' },
      ],
      correctIndex: 1,
      category: 'trivia',
    },
    {
      id: 'q4',
      question: { en: 'What does playing do?', ja: '遊ぶと何が起きる?' },
      options: [
        { en: 'Increases friendliness', ja: '親しみやすさが上がる' },
        { en: 'Increases intelligence', ja: '知性が上がる' },
        { en: 'Increases energy', ja: 'エネルギーが上がる' },
        { en: 'Decreases mood', ja: '気分が下がる' },
      ],
      correctIndex: 0,
      category: 'trivia',
    },
    {
      id: 'q5',
      question: { en: 'How do you restore energy?', ja: 'エネルギーを回復するには?' },
      options: [
        { en: 'Study', ja: '勉強' },
        { en: 'Play', ja: '遊ぶ' },
        { en: 'Rest', ja: '休憩' },
        { en: 'Chat', ja: 'チャット' },
      ],
      correctIndex: 2,
      category: 'trivia',
    },
    {
      id: 'q6',
      question: { en: 'What personality type likes studying?', ja: '勉強が好きな性格タイプは?' },
      options: [
        { en: 'Scholar', ja: '学者' },
        { en: 'Social', ja: '社交的' },
        { en: 'Playful', ja: '遊び好き' },
        { en: 'Zen', ja: '禅' },
      ],
      correctIndex: 0,
      category: 'trivia',
    },
    {
      id: 'q7',
      question: { en: 'What is the max level?', ja: '最大レベルは?' },
      options: [
        { en: '50', ja: '50' },
        { en: '99', ja: '99' },
        { en: '100', ja: '100' },
        { en: 'No limit', ja: '上限なし' },
      ],
      correctIndex: 3,
      category: 'trivia',
    },
    {
      id: 'q8',
      question: { en: 'What increases memory stat?', ja: '記憶力が上がるのは?' },
      options: [
        { en: 'Playing games', ja: 'ゲームをする' },
        { en: 'Chatting', ja: 'チャット' },
        { en: 'Studying', ja: '勉強' },
        { en: 'Resting', ja: '休憩' },
      ],
      correctIndex: 2,
      category: 'trivia',
    },
    {
      id: 'q9',
      question: { en: 'What is the rarest item rarity?', ja: '最もレアなアイテムレアリティは?' },
      options: [
        { en: 'Common', ja: 'コモン' },
        { en: 'Rare', ja: 'レア' },
        { en: 'Epic', ja: 'エピック' },
        { en: 'Legendary', ja: 'レジェンダリー' },
      ],
      correctIndex: 3,
      category: 'trivia',
    },
    {
      id: 'q10',
      question: { en: 'How many mini-game types are there?', ja: 'ミニゲームは何種類?' },
      options: [
        { en: '2', ja: '2' },
        { en: '3', ja: '3' },
        { en: '4', ja: '4' },
        { en: '5', ja: '5' },
      ],
      correctIndex: 2,
      category: 'trivia',
    },
  ];
}

// クイズゲーム初期化
export function initializeQuizGame(tier: IntelligenceTier): QuizGameState {
  const difficulty = TIER_DIFFICULTY[tier].quiz;
  const questions = generateQuizQuestions(tier);

  return {
    questions,
    currentIndex: 0,
    correctAnswers: 0,
    answers: [],
    startTime: Date.now(),
    questionStartTime: Date.now(),
    timePerQuestion: difficulty.timePerQuestion * 1000,
    isComplete: false,
  };
}

// クイズゲーム：回答
export function answerQuizQuestion(state: QuizGameState, answerIndex: number): QuizGameState {
  if (state.isComplete || state.currentIndex >= state.questions.length) return state;

  const currentQuestion = state.questions[state.currentIndex];
  const isCorrect = answerIndex === currentQuestion.correctIndex;
  const newCurrentIndex = state.currentIndex + 1;
  const isComplete = newCurrentIndex >= state.questions.length;

  return {
    ...state,
    currentIndex: newCurrentIndex,
    correctAnswers: isCorrect ? state.correctAnswers + 1 : state.correctAnswers,
    answers: [...state.answers, answerIndex],
    questionStartTime: Date.now(),
    isComplete,
  };
}

// クイズゲーム：スコア計算
export function calculateQuizScore(state: QuizGameState): number {
  if (state.questions.length === 0) return 0;
  return Math.round((state.correctAnswers / state.questions.length) * 100);
}

// 報酬計算
export function calculateRewards(
  gameType: MiniGameType,
  score: number,
  tier: IntelligenceTier,
  personalityState?: PersonalityState
): { xp: number; coins: number } {
  const config = MINI_GAME_CONFIGS[gameType];
  const multiplier = TIER_REWARD_MULTIPLIER[tier];
  const scoreMultiplier = score / 100;

  let xp = Math.round(config.baseXpReward * multiplier * scoreMultiplier);
  let coins = Math.round(config.baseCoinReward * multiplier * scoreMultiplier);

  // 性格ボーナス
  if (personalityState && personalityState.type !== 'none') {
    const bonusMultiplier = 1 + (personalityState.strength / 100) * 0.2;
    xp = Math.round(xp * bonusMultiplier);
    coins = Math.round(coins * bonusMultiplier);
  }

  return { xp, coins };
}

// アイテムドロップ判定
export function rollItemDrop(
  gameType: MiniGameType,
  score: number,
  tier: IntelligenceTier
): string | null {
  const config = MINI_GAME_CONFIGS[gameType];
  const baseChance = config.itemDropChance;
  const scoreBonus = (score / 100) * 0.1;
  const tierBonus = TIER_REWARD_MULTIPLIER[tier] * 0.05;
  const finalChance = baseChance + scoreBonus + tierBonus;

  if (Math.random() > finalChance) return null;

  // 重み付きランダム選択
  const droppableItems = getDroppableItems();
  const totalWeight = droppableItems.reduce((sum, item) => sum + item.dropWeight, 0);
  let random = Math.random() * totalWeight;

  for (const item of droppableItems) {
    random -= item.dropWeight;
    if (random <= 0) {
      return item.id;
    }
  }

  return droppableItems[0].id;
}

// ゲーム結果生成
export function createGameResult(
  gameType: MiniGameType,
  score: number,
  tier: IntelligenceTier,
  previousHighScore: number,
  personalityState?: PersonalityState
): GameResult {
  const { xp, coins } = calculateRewards(gameType, score, tier, personalityState);
  const itemDropped = rollItemDrop(gameType, score, tier);
  const thresholds = SCORE_THRESHOLDS[gameType];

  return {
    success: score >= thresholds.clear,
    score,
    maxScore: 100,
    xpEarned: xp,
    coinsEarned: coins,
    itemDropped,
    newHighScore: score > previousHighScore,
  };
}

// ミニゲーム状態更新
export function updateMiniGameState(
  state: MiniGameState,
  gameType: MiniGameType,
  result: GameResult
): MiniGameState {
  const currentScore = state.scores[gameType];
  const newScore: MiniGameScore = {
    highScore: result.newHighScore ? result.score : currentScore.highScore,
    totalPlays: currentScore.totalPlays + 1,
    totalWins: result.success ? currentScore.totalWins + 1 : currentScore.totalWins,
  };

  return {
    ...state,
    scores: {
      ...state.scores,
      [gameType]: newScore,
    },
    lastPlayedAt: {
      ...state.lastPlayedAt,
      [gameType]: Date.now(),
    },
  };
}
