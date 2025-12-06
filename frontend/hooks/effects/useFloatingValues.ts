'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { FloatingValueEffect } from '@/types/effects';

interface UseFloatingValuesOptions {
  duration?: number;       // 表示時間(ms)
  maxValues?: number;      // 最大同時表示数
  enabled?: boolean;
}

export function useFloatingValues(options: UseFloatingValuesOptions = {}) {
  const { duration = 1500, maxValues = 10, enabled = true } = options;

  const [values, setValues] = useState<FloatingValueEffect[]>([]);
  const timerRefs = useRef<Set<NodeJS.Timeout>>(new Set());
  const idCounterRef = useRef(0);

  // クリーンアップ
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(clearTimeout);
    };
  }, []);

  // 浮遊数値を追加
  const addValue = useCallback(
    (stat: string, value: number, x: number, y: number) => {
      if (!enabled || value === 0) return;

      const id = `floating-${idCounterRef.current++}`;
      const newValue: FloatingValueEffect = {
        id,
        value,
        stat,
        x,
        y,
        createdAt: Date.now(),
      };

      setValues((prev) => {
        const updated = [...prev, newValue];
        if (updated.length > maxValues) {
          return updated.slice(-maxValues);
        }
        return updated;
      });

      // 指定時間後に削除（タイマーを追跡）
      const timer = setTimeout(() => {
        setValues((prev) => prev.filter((v) => v.id !== id));
        timerRefs.current.delete(timer);
      }, duration);
      timerRefs.current.add(timer);
    },
    [enabled, duration, maxValues]
  );

  // ステータス変更をまとめて追加
  const addStatChanges = useCallback(
    (
      changes: Record<string, number>,
      baseX: number,
      baseY: number
    ) => {
      const entries = Object.entries(changes).filter(([, value]) => value !== 0);

      entries.forEach(([stat, value], index) => {
        const offsetX = (index - entries.length / 2) * 30;
        const offsetY = index * 5;

        // 少し遅延をつけて順番に表示（タイマーを追跡）
        const timer = setTimeout(() => {
          addValue(stat, value, baseX + offsetX, baseY + offsetY);
          timerRefs.current.delete(timer);
        }, index * 100);
        timerRefs.current.add(timer);
      });
    },
    [addValue]
  );

  // すべてクリア
  const clearAll = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current.clear();
    setValues([]);
  }, []);

  return {
    values,
    addValue,
    addStatChanges,
    clearAll,
  };
}
