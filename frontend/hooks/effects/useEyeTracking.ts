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
    maxOffset = 1,
    returnDelay = 3000,
  } = options;

  const [state, setState] = useState<EyeTrackingState>({
    targetX: 0,
    targetY: 0,
    isTracking: false,
  });

  const returnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  // ポインター位置を更新（ウィンドウ中心からの相対位置）
  const updateTarget = useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled) return;
      if (typeof window === 'undefined') return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // -1 to 1 の範囲に正規化
      let x = (clientX - centerX) / (window.innerWidth / 2);
      let y = (clientY - centerY) / (window.innerHeight / 2);

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

  return {
    targetX: state.targetX,
    targetY: state.targetY,
    isTracking: state.isTracking,
    updateTarget,
  };
}
