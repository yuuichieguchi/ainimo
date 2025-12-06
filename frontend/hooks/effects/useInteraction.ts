'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { InteractionState } from '@/types/effects';

interface UseInteractionOptions {
  onTap?: (x: number, y: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
  onLongPress?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: () => void;
  longPressDelay?: number;
  doubleTapDelay?: number;
  enabled?: boolean;
}

export function useInteraction(options: UseInteractionOptions = {}) {
  const {
    onTap,
    onDoubleTap,
    onLongPress,
    onDrag,
    onDragEnd,
    longPressDelay = 500,
    doubleTapDelay = 300,
    enabled = true,
  } = options;

  const [state, setState] = useState<InteractionState>({
    isPressed: false,
    isDragging: false,
    isPetting: false,
    pointerPosition: null,
    tapCount: 0,
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimer = useRef<NodeJS.Timeout | null>(null);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);
  const tapCountRef = useRef(0);
  const pettingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // クリーンアップ
  const clearTimers = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (pettingIntervalRef.current) {
      clearInterval(pettingIntervalRef.current);
      pettingIntervalRef.current = null;
    }
  }, []);

  // ポインターダウン
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;

      const x = e.clientX;
      const y = e.clientY;

      startPosition.current = { x, y };
      hasMovedRef.current = false;

      setState((prev) => ({
        ...prev,
        isPressed: true,
        pointerPosition: { x, y },
      }));

      // 長押し検出
      longPressTimer.current = setTimeout(() => {
        if (!hasMovedRef.current) {
          setState((prev) => ({ ...prev, isPetting: true }));
          onLongPress?.(x, y);

          // 撫で続けている間、定期的にコールバック
          pettingIntervalRef.current = setInterval(() => {
            onLongPress?.(x, y);
          }, 500);
        }
      }, longPressDelay);
    },
    [enabled, longPressDelay, onLongPress]
  );

  // ポインター移動
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || !state.isPressed) return;

      const x = e.clientX;
      const y = e.clientY;

      // 移動距離をチェック
      if (startPosition.current) {
        const dx = x - startPosition.current.x;
        const dy = y - startPosition.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {
          hasMovedRef.current = true;
          clearTimers();
          setState((prev) => ({
            ...prev,
            isDragging: true,
            isPetting: false,
          }));
        }
      }

      setState((prev) => ({
        ...prev,
        pointerPosition: { x, y },
      }));

      if (state.isDragging || hasMovedRef.current) {
        onDrag?.(x, y);
      }
    },
    [enabled, state.isPressed, state.isDragging, clearTimers, onDrag]
  );

  // ポインターアップ
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;

      const x = e.clientX;
      const y = e.clientY;

      clearTimers();

      // タップ判定（動いていない場合）
      if (!hasMovedRef.current && !state.isPetting) {
        tapCountRef.current += 1;

        if (doubleTapTimer.current) {
          clearTimeout(doubleTapTimer.current);
        }

        if (tapCountRef.current === 2) {
          // ダブルタップ
          onDoubleTap?.(x, y);
          tapCountRef.current = 0;
        } else {
          // シングルタップ（遅延確認）
          doubleTapTimer.current = setTimeout(() => {
            if (tapCountRef.current === 1) {
              onTap?.(x, y);
            }
            tapCountRef.current = 0;
          }, doubleTapDelay);
        }
      }

      if (state.isDragging) {
        onDragEnd?.();
      }

      setState({
        isPressed: false,
        isDragging: false,
        isPetting: false,
        pointerPosition: null,
        tapCount: 0,
      });

      startPosition.current = null;
    },
    [
      enabled,
      state.isPetting,
      state.isDragging,
      clearTimers,
      doubleTapDelay,
      onTap,
      onDoubleTap,
      onDragEnd,
    ]
  );

  // ポインターが離れた場合
  const handlePointerLeave = useCallback(() => {
    clearTimers();
    setState({
      isPressed: false,
      isDragging: false,
      isPetting: false,
      pointerPosition: null,
      tapCount: 0,
    });
    startPosition.current = null;
  }, [clearTimers]);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      clearTimers();
      if (doubleTapTimer.current) {
        clearTimeout(doubleTapTimer.current);
      }
    };
  }, [clearTimers]);

  // イベントハンドラーをまとめて返す
  const handlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerLeave,
    onPointerCancel: handlePointerLeave,
  };

  return {
    state,
    handlers,
    isPressed: state.isPressed,
    isDragging: state.isDragging,
    isPetting: state.isPetting,
    pointerPosition: state.pointerPosition,
  };
}
