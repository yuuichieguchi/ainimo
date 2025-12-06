'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { EyeTrackingState } from '@/types/effects';

interface UseEyeTrackingOptions {
  enabled?: boolean;
  smoothing?: number;      // スムージング係数 (0-1, 1が即座に追従)
  maxOffset?: number;      // 最大オフセット (-1 to 1)
  returnDelay?: number;    // 中央に戻るまでの遅延(ms)
}

export function useEyeTracking(options: UseEyeTrackingOptions = {}) {
  const {
    enabled = true,
    smoothing = 0.15,
    maxOffset = 0.3,
    returnDelay = 2000,
  } = options;

  const [state, setState] = useState<EyeTrackingState>({
    targetX: 0,
    targetY: 0,
    isTracking: false,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const returnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  // ポインター位置を更新
  const updateTarget = useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // -1 to 1 の範囲に正規化
      let x = (clientX - centerX) / (rect.width / 2);
      let y = (clientY - centerY) / (rect.height / 2);

      // 最大オフセットでクランプ
      x = Math.max(-maxOffset, Math.min(maxOffset, x));
      y = Math.max(-maxOffset, Math.min(maxOffset, y));

      targetRef.current = { x, y };

      setState((prev) => ({
        ...prev,
        isTracking: true,
      }));

      // 中央に戻るタイマーをリセット
      if (returnTimerRef.current) {
        clearTimeout(returnTimerRef.current);
      }

      returnTimerRef.current = setTimeout(() => {
        targetRef.current = { x: 0, y: 0 };
        setState((prev) => ({
          ...prev,
          isTracking: false,
        }));
      }, returnDelay);
    },
    [enabled, maxOffset, returnDelay]
  );

  // スムーズなアニメーション
  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      // 線形補間でスムーズに追従
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smoothing;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smoothing;

      // 十分に近づいたら更新を止める（パフォーマンス最適化）
      const dx = Math.abs(targetRef.current.x - currentRef.current.x);
      const dy = Math.abs(targetRef.current.y - currentRef.current.y);

      if (dx > 0.001 || dy > 0.001) {
        setState((prev) => ({
          ...prev,
          targetX: currentRef.current.x,
          targetY: currentRef.current.y,
        }));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, smoothing]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (returnTimerRef.current) {
        clearTimeout(returnTimerRef.current);
      }
    };
  }, []);

  // 目の位置をピクセル単位で計算（CSS用）
  const getEyeOffset = useCallback(
    (eyeSize: number = 10) => ({
      transform: `translate(${state.targetX * eyeSize}px, ${state.targetY * eyeSize}px)`,
    }),
    [state.targetX, state.targetY]
  );

  // グローバルマウス追従を有効化
  const enableGlobalTracking = useCallback(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateTarget(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, updateTarget]);

  return {
    containerRef,
    state,
    targetX: state.targetX,
    targetY: state.targetY,
    isTracking: state.isTracking,
    updateTarget,
    getEyeOffset,
    enableGlobalTracking,
  };
}
