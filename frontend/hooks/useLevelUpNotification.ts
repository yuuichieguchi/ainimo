import { useState, useEffect, useRef } from 'react';

interface NotificationState {
  isVisible: boolean;
  newLevel: number;
}

const LAST_NOTIFIED_LEVEL_KEY = 'ainimo_last_notified_level';
const NOTIFICATION_HIDE_DELAY = 2500;
const LEVEL_UP_RECENT_DELAY = 3000;

export function useLevelUpNotification(currentLevel: number) {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    isVisible: false,
    newLevel: currentLevel,
  });
  const [isLevelUpRecent, setIsLevelUpRecent] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef<boolean>(true);

  useEffect(() => {
    // SSR安全性チェック
    if (typeof window === 'undefined') return;

    // 初回マウント時のみ、localStorageから最後に通知したレベルを取得
    if (isInitialMount.current) {
      isInitialMount.current = false;

      try {
        // localStorageに保存されている最後に通知したレベルを確認
        const lastNotifiedLevel = localStorage.getItem(LAST_NOTIFIED_LEVEL_KEY);
        if (lastNotifiedLevel) {
          const lastLevel = parseInt(lastNotifiedLevel, 10);
          // NaNチェック: parseIntが失敗した場合は現在のレベルを保存
          if (isNaN(lastLevel)) {
            localStorage.setItem(LAST_NOTIFIED_LEVEL_KEY, currentLevel.toString());
            return;
          }
          // 現在のレベルが既に通知済みの場合はスキップ
          if (currentLevel <= lastLevel) {
            return;
          }
        } else {
          // 初回起動時は現在のレベルを保存して終了
          localStorage.setItem(LAST_NOTIFIED_LEVEL_KEY, currentLevel.toString());
          return;
        }
      } catch (error) {
        // localStorage無効時（プライベートモード等）はエラーを無視
        console.warn('localStorage is not available:', error);
        return;
      }
    }

    try {
      // localStorageから最後に通知したレベルを取得
      const lastNotifiedLevel = localStorage.getItem(LAST_NOTIFIED_LEVEL_KEY);
      const lastLevel = lastNotifiedLevel ? parseInt(lastNotifiedLevel, 10) : 0;

      // NaNチェック
      if (isNaN(lastLevel)) {
        localStorage.setItem(LAST_NOTIFIED_LEVEL_KEY, currentLevel.toString());
        return;
      }

      // レベルが上がった場合のみ通知表示
      if (currentLevel > lastLevel) {
        setNotificationState({
          isVisible: true,
          newLevel: currentLevel,
        });
        setIsLevelUpRecent(true);

        // localStorageに新しいレベルを保存
        localStorage.setItem(LAST_NOTIFIED_LEVEL_KEY, currentLevel.toString());

        // 2.5秒後に通知を自動的に非表示
        hideTimeoutRef.current = setTimeout(() => {
          setNotificationState((prev) => ({ ...prev, isVisible: false }));
        }, NOTIFICATION_HIDE_DELAY);

        // 3秒後にレベルアップ直後フラグを解除
        recentTimeoutRef.current = setTimeout(() => {
          setIsLevelUpRecent(false);
        }, LEVEL_UP_RECENT_DELAY);
      }
    } catch (error) {
      // localStorage無効時はエラーを無視
      console.warn('localStorage is not available:', error);
    }

    // クリーンアップ: タイマーを解放
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (recentTimeoutRef.current) {
        clearTimeout(recentTimeoutRef.current);
        recentTimeoutRef.current = null;
      }
    };
  }, [currentLevel]);

  const hideNotification = () => {
    setNotificationState((prev) => ({ ...prev, isVisible: false }));
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const resetNotificationState = () => {
    setNotificationState({ isVisible: false, newLevel: 1 });
    setIsLevelUpRecent(false);
    isInitialMount.current = true;
    try {
      localStorage.removeItem(LAST_NOTIFIED_LEVEL_KEY);
    } catch (error) {
      console.warn('localStorage is not available:', error);
    }
  };

  return {
    notificationState,
    isLevelUpRecent,
    hideNotification,
    resetNotificationState,
  };
}
