'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { QuizGameState } from '@/types/miniGame';
import { Language } from '@/hooks/useLanguage';

interface QuizGameProps {
  gameState: QuizGameState;
  onAnswer: (index: number) => void;
  onComplete: () => void;
  language: Language;
}

export function QuizGame({
  gameState,
  onAnswer,
  onComplete,
  language,
}: QuizGameProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    gameState.timePerQuestion - (Date.now() - gameState.questionStartTime)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const hasCompletedRef = useRef(false);

  // 現在の質問
  const currentQuestion = gameState.questions[gameState.currentIndex];

  // タイマー
  useEffect(() => {
    if (gameState.isComplete) return;

    const interval = setInterval(() => {
      const remaining = gameState.timePerQuestion - (Date.now() - gameState.questionStartTime);
      setTimeRemaining(Math.max(0, remaining));

      if (remaining <= 0) {
        onAnswer(-1); // タイムアウト
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.questionStartTime, gameState.timePerQuestion, gameState.isComplete, onAnswer]);

  // 質問が変わったらリセット
  useEffect(() => {
    setSelectedAnswer(null);
    setTimeRemaining(gameState.timePerQuestion);
  }, [gameState.currentIndex, gameState.timePerQuestion]);

  // ゲーム完了チェック
  useEffect(() => {
    if (gameState.isComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [gameState.isComplete, onComplete]);

  const handleAnswer = useCallback(
    (index: number) => {
      if (selectedAnswer !== null) return;
      setSelectedAnswer(index);

      setTimeout(() => {
        onAnswer(index);
      }, 500);
    },
    [selectedAnswer, onAnswer]
  );

  if (!currentQuestion) {
    return null;
  }

  const progress = ((gameState.currentIndex) / gameState.questions.length) * 100;
  const timeProgress = (timeRemaining / gameState.timePerQuestion) * 100;

  return (
    <div className="p-4">
      {/* 進捗バー */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
          <span>
            {language === 'ja' ? '問題' : 'Question'} {gameState.currentIndex + 1}/{gameState.questions.length}
          </span>
          <span>✅ {gameState.correctAnswers}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* タイマーバー */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              timeProgress < 30 ? 'bg-red-500' : timeProgress < 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${timeProgress}%` }}
          />
        </div>
      </div>

      {/* 質問 */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center">
          {currentQuestion.question[language]}
        </h3>
      </div>

      {/* 選択肢 */}
      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === currentQuestion.correctIndex;
          const showResult = selectedAnswer !== null;

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`
                w-full p-4 rounded-lg text-left transition-all transform
                ${showResult
                  ? isCorrect
                    ? 'bg-green-500 text-white scale-105'
                    : isSelected
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                  : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-blue-100 dark:hover:bg-gray-500 hover:scale-102 cursor-pointer shadow-md'
                }
              `}
            >
              <span className="font-medium">
                {String.fromCharCode(65 + index)}. {option[language]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
