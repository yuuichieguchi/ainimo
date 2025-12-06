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
  const isAnimatingRef = useRef(false);

  // アニメーションループを開始
  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current || !enabled) return;
    isAnimatingRef.current = true;

    const animate = () => {
      // 線形補間でスムーズに追従
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smoothing;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smoothing;

      // 十分に近づいたかチェック
      const dx = Math.abs(targetRef.current.x - currentRef.current.x);
      const dy = Math.abs(targetRef.current.y - currentRef.current.y);

      if (dx > 0.001 || dy > 0.001) {
        setState((prev) => ({
          ...prev,
          targetX: currentRef.current.x,
          targetY: currentRef.current.y,
        }));
        // まだ目標に到達していないのでループを継続
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 目標に到達したのでループを停止（CPU節約）
        isAnimatingRef.current = false;
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [enabled, smoothing]);

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

      // アニメーションを開始（停止中の場合のみ）
      startAnimation();

      // 中央に戻るタイマーをリセット
      if (returnTimerRef.current) {
        clearTimeout(returnTimerRef.current);
      }

      returnTimerRef.current = setTimeout(() => {
        targetRef.current = { x: 0, y: 0 };
        // 中央に戻るアニメーションを開始
        startAnimation();
        setState((prev) => ({
          ...prev,
          isTracking: false,
        }));
      }, returnDelay);
    },
    [enabled, maxOffset, returnDelay, startAnimation]
  );

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        isAnimatingRef.current = false;
      }
    };
  }, []);

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
