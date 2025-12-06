'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { EmoteType, EmoteOptions } from '@/types/effects';

interface UseEmoteOptions {
  defaultDuration?: number;
  enabled?: boolean;
}

export function useEmote(options: UseEmoteOptions = {}) {
  const { defaultDuration = 2000, enabled = true } = options;

  const [activeEmote, setActiveEmote] = useState<EmoteType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // エモートを表示
  const showEmote = useCallback(
    (emote: EmoteType, duration?: number) => {
      if (!enabled) return;

      // 既存のタイマーをクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setActiveEmote(emote);
      setIsVisible(true);

      // 指定時間後に非表示
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        // アニメーション完了後にemoteをクリア
        setTimeout(() => setActiveEmote(null), 300);
      }, duration ?? defaultDuration);
    },
    [enabled, defaultDuration]
  );

  // エモートを非表示
  const hideEmote = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
    setTimeout(() => setActiveEmote(null), 300);
  }, []);

  // 気分に応じたエモートを表示
  const showMoodEmote = useCallback(
    (mood: number) => {
      if (mood >= 70) {
        showEmote('happy', 1500);
      } else if (mood >= 40) {
        // normal - 特にエモートなし
      } else if (mood >= 20) {
        showEmote('sleep', 1500);
      } else {
        showEmote('thought', 1500);
      }
    },
    [showEmote]
  );

  // アクションに応じたエモートを表示
  const showActionEmote = useCallback(
    (action: string) => {
      switch (action) {
        case 'study':
          showEmote('sparkle', 1500);
          break;
        case 'play':
          showEmote('music', 1500);
          break;
        case 'rest':
          showEmote('sleep', 2000);
          break;
        case 'talk':
          showEmote('thought', 1500);
          break;
        case 'pet':
          showEmote('heart', 1500);
          break;
      }
    },
    [showEmote]
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    activeEmote,
    isVisible,
    showEmote,
    hideEmote,
    showMoodEmote,
    showActionEmote,
  };
}
