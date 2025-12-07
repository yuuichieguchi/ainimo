'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Achievement, AchievementState, BilingualText } from '@/types/achievement';
import { ActionType, GameParameters } from '@/types/game';
import {
  getInitialAchievementState,
  updateAchievementStats,
  updateMessageStats,
  updateLoginStreak,
  updateRestLimitHitStats,
  detectNewUnlocks,
  unlockAchievements,
  consumeNotification,
  selectTitle as selectTitleEngine,
  isUnlocked,
} from '@/lib/achievementEngine';
import { ACHIEVEMENTS, getAchievementById, TOTAL_ACHIEVEMENT_COUNT } from '@/lib/achievementDefinitions';

interface UseAchievementsReturn {
  achievementState: AchievementState;
  allAchievements: Achievement[];

  currentNotification: Achievement | null;
  dismissNotification: () => void;

  selectedTitle: BilingualText | null;
  selectTitle: (id: string | null) => void;

  unlockedCount: number;
  totalCount: number;

  processAction: (action: ActionType, parameters: GameParameters) => void;
  processChat: (parameters: GameParameters) => void;
  processRestLimitHit: () => void;
  processLogin: () => void;

  loadAchievementState: (state: AchievementState) => void;
  resetAchievements: () => void;
}

export function useAchievements(initialState?: AchievementState): UseAchievementsReturn {
  const [achievementState, setAchievementState] = useState<AchievementState>(
    initialState || getInitialAchievementState()
  );
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);

  // 最新のstateを参照するためのref（stale closure対策）
  const stateRef = useRef(achievementState);
  useEffect(() => {
    stateRef.current = achievementState;
  }, [achievementState]);

  // 通知キューの処理
  useEffect(() => {
    if (achievementState.pendingNotifications.length > 0 && !currentNotification) {
      const { state: newState, achievementId } = consumeNotification(achievementState);
      if (achievementId) {
        const achievement = getAchievementById(achievementId);
        if (achievement) {
          setCurrentNotification(achievement);
          setAchievementState(newState);
        }
      }
    }
  }, [achievementState.pendingNotifications, currentNotification, achievementState]);

  // 通知を閉じる
  const dismissNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  // アクション処理（functional updateで最新状態を使用）
  const processAction = useCallback((action: ActionType, parameters: GameParameters): void => {
    setAchievementState(prevState => {
      // 統計更新
      const updatedStats = updateAchievementStats(prevState.stats, action);
      let newState = { ...prevState, stats: updatedStats };

      // 新規解除チェック
      const newUnlocks = detectNewUnlocks(ACHIEVEMENTS, newState, parameters);
      if (newUnlocks.length > 0) {
        newState = unlockAchievements(newState, newUnlocks);
      }

      return newState;
    });
  }, []);

  // チャット処理（functional updateで最新状態を使用）
  const processChat = useCallback((parameters: GameParameters): void => {
    setAchievementState(prevState => {
      // メッセージ数更新
      const updatedStats = updateMessageStats(prevState.stats);
      let newState = { ...prevState, stats: updatedStats };

      // 新規解除チェック
      const newUnlocks = detectNewUnlocks(ACHIEVEMENTS, newState, parameters);
      if (newUnlocks.length > 0) {
        newState = unlockAchievements(newState, newUnlocks);
      }

      return newState;
    });
  }, []);

  // 休憩上限到達処理
  const processRestLimitHit = useCallback((): void => {
    setAchievementState(prevState => {
      const updatedStats = updateRestLimitHitStats(prevState.stats);
      return { ...prevState, stats: updatedStats };
    });
  }, []);

  // ログイン処理
  const processLogin = useCallback((): void => {
    setAchievementState(prevState => {
      const updatedStats = updateLoginStreak(prevState.stats);
      return { ...prevState, stats: updatedStats };
    });
  }, []);

  // タイトル選択
  const selectTitle = useCallback((id: string | null) => {
    setAchievementState(prevState => {
      // 選択しようとしているタイトルが解除済みか確認
      if (id !== null && !isUnlocked(id, prevState.unlocked)) {
        return prevState;
      }
      return selectTitleEngine(prevState, id);
    });
  }, []);

  // 状態読み込み
  const loadAchievementState = useCallback((state: AchievementState) => {
    setAchievementState(state);
  }, []);

  // リセット
  const resetAchievements = useCallback(() => {
    setAchievementState(getInitialAchievementState());
    setCurrentNotification(null);
  }, []);

  // 選択中のタイトルを取得
  const selectedTitle: BilingualText | null = achievementState.selectedTitleId
    ? getAchievementById(achievementState.selectedTitleId)?.title || null
    : null;

  return {
    achievementState,
    allAchievements: ACHIEVEMENTS,

    currentNotification,
    dismissNotification,

    selectedTitle,
    selectTitle,

    unlockedCount: achievementState.unlocked.length,
    totalCount: TOTAL_ACHIEVEMENT_COUNT,

    processAction,
    processChat,
    processRestLimitHit,
    processLogin,

    loadAchievementState,
    resetAchievements,
  };
}
