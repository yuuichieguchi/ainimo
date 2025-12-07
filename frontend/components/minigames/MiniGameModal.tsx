'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  MiniGameType,
  GameResult as GameResultType,
  ActiveGameState,
  CanPlayResult,
} from '@/types/miniGame';
import { IntelligenceTier } from '@/types/game';
import { PersonalityState } from '@/types/personality';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { MINI_GAME_CONFIGS } from '@/lib/miniGameDefinitions';
import { MiniGameSelector } from './MiniGameSelector';
import { GameResult } from './GameResult';
import { MemoryGame } from './MemoryGame';
import { RhythmGame } from './RhythmGame';
import { PuzzleGame } from './PuzzleGame';
import { QuizGame } from './QuizGame';

interface MiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  energy: number;
  tier: IntelligenceTier;
  personalityState?: PersonalityState;
  onEnergySpent: (amount: number) => void;
  onRewardsEarned: (xp: number, coins: number, itemId: string | null) => void;
  language: Language;
  activeGame: ActiveGameState | null;
  canPlay: (gameType: MiniGameType, energy: number) => CanPlayResult;
  startGame: (gameType: MiniGameType, tier: IntelligenceTier) => boolean;
  endGame: (tier: IntelligenceTier, personalityState?: PersonalityState) => GameResultType | null;
  cancelGame: () => void;
  getCooldownRemaining: (gameType: MiniGameType) => number;
  flipCard: (index: number) => void;
  resetCards: () => void;
  beginRhythm: () => void;
  hitNote: (lane: number) => void;
  missNote: () => void;
  moveTile: (index: number) => void;
  answerQuestion: (index: number) => void;
}

type ModalView = 'selector' | 'playing' | 'result';

export function MiniGameModal({
  isOpen,
  onClose,
  energy,
  tier,
  personalityState,
  onEnergySpent,
  onRewardsEarned,
  language,
  activeGame,
  canPlay,
  startGame,
  endGame,
  cancelGame,
  getCooldownRemaining,
  flipCard,
  resetCards,
  beginRhythm,
  hitNote,
  missNote,
  moveTile,
  answerQuestion,
}: MiniGameModalProps) {
  const [view, setView] = useState<ModalView>('selector');
  const [result, setResult] = useState<GameResultType | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<MiniGameType | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setView('selector');
      setResult(null);
      setSelectedGameType(null);
      cancelGame();
    }
  }, [isOpen, cancelGame]);

  const handleSelectGame = useCallback(
    (gameType: MiniGameType) => {
      const playResult = canPlay(gameType, energy);
      if (!playResult.canPlay) return;

      const config = MINI_GAME_CONFIGS[gameType];
      onEnergySpent(config.energyCost);
      setSelectedGameType(gameType);

      if (startGame(gameType, tier)) {
        setView('playing');
      }
    },
    [canPlay, energy, onEnergySpent, startGame, tier]
  );

  const handleGameComplete = useCallback(() => {
    const gameResult = endGame(tier, personalityState);
    if (gameResult) {
      setResult(gameResult);
      onRewardsEarned(gameResult.xpEarned, gameResult.coinsEarned, gameResult.itemDropped);
      setView('result');
    }
  }, [endGame, tier, personalityState, onRewardsEarned]);

  const handlePlayAgain = useCallback(() => {
    setResult(null);
    setView('selector');
    setSelectedGameType(null);
  }, []);

  if (!isOpen) return null;

  const renderGameContent = () => {
    if (!activeGame) return null;

    switch (activeGame.type) {
      case 'memory':
        return (
          <MemoryGame
            gameState={activeGame.state}
            onFlipCard={flipCard}
            onResetCards={resetCards}
            onComplete={handleGameComplete}
            language={language}
          />
        );
      case 'rhythm':
        return (
          <RhythmGame
            gameState={activeGame.state}
            onBegin={beginRhythm}
            onHitNote={hitNote}
            onMissNote={missNote}
            onComplete={handleGameComplete}
            language={language}
          />
        );
      case 'puzzle':
        return (
          <PuzzleGame
            gameState={activeGame.state}
            onMoveTile={moveTile}
            onComplete={handleGameComplete}
            language={language}
          />
        );
      case 'quiz':
        return (
          <QuizGame
            gameState={activeGame.state}
            onAnswer={answerQuestion}
            onComplete={handleGameComplete}
            language={language}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={view === 'selector' ? onClose : undefined}
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {view === 'selector' && t('miniGames', language)}
            {view === 'playing' && selectedGameType && MINI_GAME_CONFIGS[selectedGameType].name[language]}
            {view === 'result' && t('miniGameResult', language)}
          </h2>
          {view === 'selector' && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        <div className="p-4">
          {view === 'selector' && (
            <MiniGameSelector
              energy={energy}
              canPlay={canPlay}
              getCooldownRemaining={getCooldownRemaining}
              onSelectGame={handleSelectGame}
              language={language}
            />
          )}

          {view === 'playing' && renderGameContent()}

          {view === 'result' && result && (
            <GameResult
              result={result}
              onPlayAgain={handlePlayAgain}
              onClose={onClose}
              language={language}
            />
          )}
        </div>
      </div>
    </div>
  );
}
