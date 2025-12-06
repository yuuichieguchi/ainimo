import { renderHook, act } from '@testing-library/react';
import { useFloatingValues } from '@/hooks/effects/useFloatingValues';

describe('useFloatingValues', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with empty values array', () => {
      const { result } = renderHook(() => useFloatingValues());

      expect(result.current.values).toEqual([]);
    });
  });

  describe('addValue', () => {
    it('should add a single floating value', () => {
      const { result } = renderHook(() => useFloatingValues());

      act(() => {
        result.current.addValue('xp', 10, 100, 50);
      });

      expect(result.current.values).toHaveLength(1);
      expect(result.current.values[0]).toMatchObject({
        stat: 'xp',
        value: 10,
        x: 100,
        y: 50,
      });
    });

    it('should not add value when value is 0', () => {
      const { result } = renderHook(() => useFloatingValues());

      act(() => {
        result.current.addValue('xp', 0, 100, 50);
      });

      expect(result.current.values).toHaveLength(0);
    });

    it('should remove value after duration', () => {
      const { result } = renderHook(() => useFloatingValues({ duration: 1000 }));

      act(() => {
        result.current.addValue('xp', 10, 100, 50);
      });

      expect(result.current.values).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(1100);
      });

      expect(result.current.values).toHaveLength(0);
    });
  });

  describe('addStatChanges', () => {
    it('should add multiple stat changes with delayed timing', () => {
      const { result } = renderHook(() => useFloatingValues());

      act(() => {
        result.current.addStatChanges({ xp: 10, intelligence: 5, energy: -20 }, 100, 50);
      });

      // 初期状態では遅延により0
      expect(result.current.values).toHaveLength(0);

      // 最初の値が追加される（0ms遅延）
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current.values).toHaveLength(1);

      // 2番目の値が追加される（100ms遅延）
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(result.current.values).toHaveLength(2);

      // 3番目の値が追加される（200ms遅延）
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(result.current.values).toHaveLength(3);

      const stats = result.current.values.map((v) => v.stat);
      expect(stats).toContain('xp');
      expect(stats).toContain('intelligence');
      expect(stats).toContain('energy');
    });

    it('should spread values around the center point', () => {
      const { result } = renderHook(() => useFloatingValues());

      act(() => {
        result.current.addStatChanges({ xp: 10, intelligence: 5, memory: 3 }, 100, 50);
        // すべての値が追加されるまで待つ
        jest.advanceTimersByTime(300);
      });

      // 各値のy座標が異なることを確認（spreadされている）
      const yValues = result.current.values.map((v) => v.y);
      const uniqueYValues = new Set(yValues);
      expect(uniqueYValues.size).toBeGreaterThan(1);
    });

    it('should not add values when disabled', () => {
      const { result } = renderHook(() => useFloatingValues({ enabled: false }));

      act(() => {
        result.current.addStatChanges({ xp: 10, intelligence: 5 }, 100, 50);
        jest.advanceTimersByTime(300);
      });

      expect(result.current.values).toHaveLength(0);
    });

    it('should filter out zero values', () => {
      const { result } = renderHook(() => useFloatingValues());

      act(() => {
        result.current.addStatChanges({ xp: 10, intelligence: 0, energy: -20 }, 100, 50);
        jest.advanceTimersByTime(300);
      });

      // 0の値はフィルタされる
      expect(result.current.values).toHaveLength(2);
      const stats = result.current.values.map((v) => v.stat);
      expect(stats).not.toContain('intelligence');
    });
  });

  describe('clearAll', () => {
    it('should clear all values', () => {
      const { result } = renderHook(() => useFloatingValues());

      act(() => {
        result.current.addValue('xp', 10, 100, 50);
        result.current.addValue('intelligence', 5, 100, 60);
      });

      expect(result.current.values).toHaveLength(2);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.values).toHaveLength(0);
    });
  });

  describe('memory cleanup', () => {
    it('should clean up timers on unmount', () => {
      const { result, unmount } = renderHook(() => useFloatingValues({ duration: 5000 }));

      act(() => {
        result.current.addValue('xp', 10, 100, 50);
        result.current.addValue('intelligence', 5, 100, 60);
      });

      expect(result.current.values).toHaveLength(2);

      // unmountしてもエラーが起きないことを確認
      unmount();

      // タイマーを進めてもエラーが起きないことを確認
      act(() => {
        jest.advanceTimersByTime(6000);
      });
    });
  });

  describe('maxValues limit', () => {
    it('should respect maxValues limit', () => {
      const { result } = renderHook(() => useFloatingValues({ maxValues: 3 }));

      act(() => {
        // 5つの値を直接追加
        result.current.addValue('xp', 10, 100, 50);
        result.current.addValue('intelligence', 5, 100, 55);
        result.current.addValue('memory', 3, 100, 60);
        result.current.addValue('friendliness', 2, 100, 65);
        result.current.addValue('energy', -10, 100, 70);
      });

      // maxValuesが3なので、最新の3つだけが残る
      expect(result.current.values.length).toBeLessThanOrEqual(3);
    });
  });
});
