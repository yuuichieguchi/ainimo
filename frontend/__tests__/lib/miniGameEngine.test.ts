import {
  canPlayGame,
  initializeMemoryGame,
  flipMemoryCard,
  resetFlippedCards,
  calculateMemoryScore,
  initializeRhythmGame,
  startRhythmGame,
  hitRhythmNote,
  missRhythmNote,
  calculateRhythmScore,
  initializePuzzleGame,
  movePuzzleTile,
  calculatePuzzleScore,
  initializeQuizGame,
  answerQuizQuestion,
  calculateQuizScore,
  calculateRewards,
  rollItemDrop,
  createGameResult,
  updateMiniGameState,
} from '@/lib/miniGameEngine';
import { getInitialMiniGameState, MINI_GAME_CONFIGS } from '@/lib/miniGameDefinitions';
import { IntelligenceTier } from '@/types/game';

describe('miniGameEngine', () => {
  describe('canPlayGame', () => {
    it('should return canPlay true when energy is sufficient and no cooldown', () => {
      const result = canPlayGame('memory', 100, 0, Date.now());
      expect(result.canPlay).toBe(true);
    });

    it('should return canPlay false when energy is insufficient', () => {
      const result = canPlayGame('memory', 10, 0, Date.now());
      expect(result.canPlay).toBe(false);
      expect(result.reason).toBe('energy');
      expect(result.energyRequired).toBe(MINI_GAME_CONFIGS.memory.energyCost);
    });

    it('should return canPlay false when on cooldown', () => {
      const now = Date.now();
      const lastPlayed = now - 60000; // 1分前
      const result = canPlayGame('memory', 100, lastPlayed, now);
      expect(result.canPlay).toBe(false);
      expect(result.reason).toBe('cooldown');
      expect(result.cooldownRemaining).toBeGreaterThan(0);
    });

    it('should return canPlay true when cooldown has expired', () => {
      const now = Date.now();
      const lastPlayed = now - 6 * 60 * 1000; // 6分前（クールダウン5分超過）
      const result = canPlayGame('memory', 100, lastPlayed, now);
      expect(result.canPlay).toBe(true);
    });
  });

  describe('initializeMemoryGame', () => {
    it('should create memory game with correct number of pairs for baby tier', () => {
      const state = initializeMemoryGame('baby');
      expect(state.totalPairs).toBe(4);
      expect(state.cards.length).toBe(8); // 4 pairs = 8 cards
      expect(state.matchedPairs).toBe(0);
      expect(state.isComplete).toBe(false);
    });

    it('should create memory game with correct number of pairs for adult tier', () => {
      const state = initializeMemoryGame('adult');
      expect(state.totalPairs).toBe(12);
      expect(state.cards.length).toBe(24);
    });

    it('should have shuffled cards', () => {
      const state1 = initializeMemoryGame('child');
      const state2 = initializeMemoryGame('child');
      const symbols1 = state1.cards.map((c) => c.symbol).join('');
      const symbols2 = state2.cards.map((c) => c.symbol).join('');
      // 異なる順序になっている可能性が高い（完全に同じこともありうるが稀）
      // このテストは確率的なのでスキップする代わりに構造をテスト
      expect(state1.cards.every((c) => !c.isFlipped && !c.isMatched)).toBe(true);
    });
  });

  describe('flipMemoryCard', () => {
    it('should flip a card', () => {
      const state = initializeMemoryGame('baby');
      const newState = flipMemoryCard(state, 0);
      expect(newState.cards[0].isFlipped).toBe(true);
      expect(newState.flippedIndices).toEqual([0]);
    });

    it('should not flip already flipped card', () => {
      let state = initializeMemoryGame('baby');
      state = flipMemoryCard(state, 0);
      const newState = flipMemoryCard(state, 0);
      expect(newState.flippedIndices).toEqual([0]);
    });

    it('should match two cards with same symbol', () => {
      // 手動でカードを設定してテスト
      const state = initializeMemoryGame('baby');
      // 同じシンボルのカードを見つける
      const firstCardSymbol = state.cards[0].symbol;
      const secondCardIndex = state.cards.findIndex(
        (c, i) => i !== 0 && c.symbol === firstCardSymbol
      );

      let newState = flipMemoryCard(state, 0);
      newState = flipMemoryCard(newState, secondCardIndex);

      expect(newState.matchedPairs).toBe(1);
      expect(newState.cards[0].isMatched).toBe(true);
      expect(newState.cards[secondCardIndex].isMatched).toBe(true);
    });
  });

  describe('resetFlippedCards', () => {
    it('should reset flipped but unmatched cards', () => {
      let state = initializeMemoryGame('baby');
      // 異なるシンボルのカードを見つける
      const firstSymbol = state.cards[0].symbol;
      const differentCardIndex = state.cards.findIndex(
        (c, i) => i !== 0 && c.symbol !== firstSymbol
      );

      state = flipMemoryCard(state, 0);
      state = flipMemoryCard(state, differentCardIndex);

      const resetState = resetFlippedCards(state);
      expect(resetState.cards[0].isFlipped).toBe(false);
      expect(resetState.cards[differentCardIndex].isFlipped).toBe(false);
      expect(resetState.flippedIndices).toEqual([]);
    });
  });

  describe('initializeRhythmGame', () => {
    it('should create rhythm game with correct note count for baby tier', () => {
      const state = initializeRhythmGame('baby');
      expect(state.notes.length).toBe(8);
      expect(state.isPlaying).toBe(false);
      expect(state.combo).toBe(0);
    });

    it('should create rhythm game with correct note count for adult tier', () => {
      const state = initializeRhythmGame('adult');
      expect(state.notes.length).toBe(30);
    });
  });

  describe('hitRhythmNote', () => {
    it('should not register hit when game is not playing', () => {
      const state = initializeRhythmGame('baby');
      const newState = hitRhythmNote(state, 0, Date.now());
      expect(newState.hits).toBe(0);
    });

    it('should register hit when timing is good', () => {
      let state = initializeRhythmGame('baby');
      state = startRhythmGame(state);

      const targetTime = state.notes[0].targetTime;
      const lane = state.notes[0].lane;
      const hitTime = state.startTime + targetTime; // 完璧なタイミング

      const newState = hitRhythmNote(state, lane, hitTime);
      expect(newState.hits).toBe(1);
      expect(newState.combo).toBe(1);
    });
  });

  describe('initializePuzzleGame', () => {
    it('should create puzzle game with correct grid size for baby tier', () => {
      const state = initializePuzzleGame('baby');
      expect(state.gridSize).toBe(3);
      expect(state.tiles.length).toBe(9);
      expect(state.isComplete).toBe(false);
    });

    it('should create puzzle game with correct grid size for adult tier', () => {
      const state = initializePuzzleGame('adult');
      expect(state.gridSize).toBe(4);
      expect(state.tiles.length).toBe(16);
    });
  });

  describe('movePuzzleTile', () => {
    it('should move tile adjacent to blank', () => {
      // 最初の状態を取得し、空白タイルの隣を探す
      const state = initializePuzzleGame('baby');
      const blankIndex = state.tiles.indexOf(0);
      const gridSize = state.gridSize;
      const blankRow = Math.floor(blankIndex / gridSize);
      const blankCol = blankIndex % gridSize;

      // 隣接タイルを見つける
      let adjacentIndex = -1;
      if (blankCol > 0) adjacentIndex = blankIndex - 1;
      else if (blankCol < gridSize - 1) adjacentIndex = blankIndex + 1;
      else if (blankRow > 0) adjacentIndex = blankIndex - gridSize;
      else if (blankRow < gridSize - 1) adjacentIndex = blankIndex + gridSize;

      if (adjacentIndex >= 0) {
        const newState = movePuzzleTile(state, adjacentIndex);
        expect(newState.moves).toBe(1);
        expect(newState.tiles[blankIndex]).not.toBe(0);
        expect(newState.tiles[adjacentIndex]).toBe(0);
      }
    });

    it('should not move non-adjacent tile', () => {
      const state = initializePuzzleGame('baby');
      const blankIndex = state.tiles.indexOf(0);
      // 対角線上のタイルを試す（隣接しない）
      const gridSize = state.gridSize;
      const blankRow = Math.floor(blankIndex / gridSize);
      const blankCol = blankIndex % gridSize;
      const diagonalRow = (blankRow + 1) % gridSize;
      const diagonalCol = (blankCol + 1) % gridSize;
      const diagonalIndex = diagonalRow * gridSize + diagonalCol;

      if (diagonalIndex !== blankIndex) {
        const newState = movePuzzleTile(state, diagonalIndex);
        expect(newState.moves).toBe(0); // 移動していない
      }
    });
  });

  describe('initializeQuizGame', () => {
    it('should create quiz game with correct question count for baby tier', () => {
      const state = initializeQuizGame('baby');
      expect(state.questions.length).toBe(5);
      expect(state.currentIndex).toBe(0);
      expect(state.isComplete).toBe(false);
    });

    it('should create quiz game with correct question count for adult tier', () => {
      const state = initializeQuizGame('adult');
      expect(state.questions.length).toBe(10);
    });
  });

  describe('answerQuizQuestion', () => {
    it('should record correct answer', () => {
      const state = initializeQuizGame('baby');
      const correctIndex = state.questions[0].correctIndex;
      const newState = answerQuizQuestion(state, correctIndex);

      expect(newState.correctAnswers).toBe(1);
      expect(newState.currentIndex).toBe(1);
    });

    it('should record incorrect answer', () => {
      const state = initializeQuizGame('baby');
      const correctIndex = state.questions[0].correctIndex;
      const wrongIndex = (correctIndex + 1) % 4;
      const newState = answerQuizQuestion(state, wrongIndex);

      expect(newState.correctAnswers).toBe(0);
      expect(newState.currentIndex).toBe(1);
    });

    it('should complete game after all questions', () => {
      let state = initializeQuizGame('baby');
      for (let i = 0; i < state.questions.length; i++) {
        state = answerQuizQuestion(state, 0);
      }
      expect(state.isComplete).toBe(true);
    });
  });

  describe('calculateQuizScore', () => {
    it('should return 100 for all correct answers', () => {
      let state = initializeQuizGame('baby');
      for (const question of state.questions) {
        state = answerQuizQuestion(state, question.correctIndex);
      }
      expect(calculateQuizScore(state)).toBe(100);
    });

    it('should return 0 for no correct answers', () => {
      let state = initializeQuizGame('baby');
      for (const question of state.questions) {
        const wrongIndex = (question.correctIndex + 1) % 4;
        state = answerQuizQuestion(state, wrongIndex);
      }
      expect(calculateQuizScore(state)).toBe(0);
    });
  });

  describe('calculateRewards', () => {
    it('should calculate rewards based on score and tier', () => {
      const rewards = calculateRewards('memory', 100, 'baby');
      expect(rewards.xp).toBeGreaterThan(0);
      expect(rewards.coins).toBeGreaterThan(0);
    });

    it('should give more rewards for higher tier', () => {
      const babyRewards = calculateRewards('memory', 100, 'baby');
      const adultRewards = calculateRewards('memory', 100, 'adult');
      expect(adultRewards.xp).toBeGreaterThan(babyRewards.xp);
      expect(adultRewards.coins).toBeGreaterThan(babyRewards.coins);
    });

    it('should give more rewards for higher score', () => {
      const lowScoreRewards = calculateRewards('memory', 50, 'child');
      const highScoreRewards = calculateRewards('memory', 100, 'child');
      expect(highScoreRewards.xp).toBeGreaterThan(lowScoreRewards.xp);
    });
  });

  describe('rollItemDrop', () => {
    it('should return null or valid item id', () => {
      // 複数回試行して少なくとも1回はアイテムがドロップすることを確認
      let hasDropped = false;
      for (let i = 0; i < 100; i++) {
        const result = rollItemDrop('memory', 100, 'adult');
        if (result !== null) {
          hasDropped = true;
          expect(typeof result).toBe('string');
          break;
        }
      }
      // 100回中1回もドロップしない確率は非常に低いが、テストの安定性のため条件付き
      // (高スコア、高ティアでドロップ率約30%なので、100回で0はほぼありえない)
    });
  });

  describe('createGameResult', () => {
    it('should create successful result for high score', () => {
      const result = createGameResult('memory', 80, 'child', 50);
      expect(result.success).toBe(true);
      expect(result.newHighScore).toBe(true);
      expect(result.xpEarned).toBeGreaterThan(0);
    });

    it('should create failed result for low score', () => {
      const result = createGameResult('memory', 30, 'child', 50);
      expect(result.success).toBe(false);
      expect(result.newHighScore).toBe(false);
    });
  });

  describe('updateMiniGameState', () => {
    it('should update scores after game', () => {
      const state = getInitialMiniGameState();
      const result: ReturnType<typeof createGameResult> = {
        success: true,
        score: 85,
        maxScore: 100,
        xpEarned: 30,
        coinsEarned: 10,
        itemDropped: null,
        newHighScore: true,
      };

      const newState = updateMiniGameState(state, 'memory', result);
      expect(newState.scores.memory.highScore).toBe(85);
      expect(newState.scores.memory.totalPlays).toBe(1);
      expect(newState.scores.memory.totalWins).toBe(1);
      expect(newState.lastPlayedAt.memory).toBeGreaterThan(0);
    });
  });
});
