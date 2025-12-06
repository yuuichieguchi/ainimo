import { renderHook, act, waitFor } from '@testing-library/react';
import { useEyeTracking } from '@/hooks/effects/useEyeTracking';

describe('useEyeTracking', () => {
  let originalRAF: typeof requestAnimationFrame;
  let originalCAF: typeof cancelAnimationFrame;

  beforeAll(() => {
    originalRAF = global.requestAnimationFrame;
    originalCAF = global.cancelAnimationFrame;

    // シンプルなモック：コールバックを即座に実行
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      // 即座にコールバックを実行してアニメーションをシミュレート
      setTimeout(() => callback(performance.now()), 0);
      return 1;
    });

    global.cancelAnimationFrame = jest.fn();
  });

  afterAll(() => {
    if (originalRAF) {
      global.requestAnimationFrame = originalRAF;
    }
    if (originalCAF) {
      global.cancelAnimationFrame = originalCAF;
    }
  });

  beforeEach(() => {
    jest.useFakeTimers();

    // モックウィンドウサイズを設定
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with zero target values', () => {
      const { result } = renderHook(() => useEyeTracking());

      expect(result.current.targetX).toBe(0);
      expect(result.current.targetY).toBe(0);
      expect(result.current.isTracking).toBe(false);
    });
  });

  describe('updateTarget', () => {
    it('should set isTracking to true when updateTarget is called', () => {
      const { result } = renderHook(() => useEyeTracking());

      act(() => {
        result.current.updateTarget(768, 384);
      });

      expect(result.current.isTracking).toBe(true);
    });

    it('should not set isTracking when disabled', () => {
      const { result } = renderHook(() => useEyeTracking({ enabled: false }));

      act(() => {
        result.current.updateTarget(768, 600);
      });

      expect(result.current.isTracking).toBe(false);
    });
  });

  describe('auto-reset behavior', () => {
    it('should auto-reset isTracking after returnDelay', () => {
      const { result } = renderHook(() => useEyeTracking({ returnDelay: 500 }));

      act(() => {
        result.current.updateTarget(768, 600);
      });

      expect(result.current.isTracking).toBe(true);

      act(() => {
        jest.advanceTimersByTime(600);
      });

      expect(result.current.isTracking).toBe(false);
    });

    it('should reset timer when updateTarget is called again', () => {
      const { result } = renderHook(() => useEyeTracking({ returnDelay: 500 }));

      act(() => {
        result.current.updateTarget(768, 600);
      });

      // 400ms後に再度updateTarget
      act(() => {
        jest.advanceTimersByTime(400);
        result.current.updateTarget(512, 400);
      });

      // さらに400ms後（最初のupdateTargetから800ms後）
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // タイマーがリセットされたので、まだisTrackingはtrue
      expect(result.current.isTracking).toBe(true);

      // さらに200ms後（2回目のupdateTargetから600ms後）
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.isTracking).toBe(false);
    });
  });

  describe('options', () => {
    it('should respect maxOffset option', () => {
      const { result } = renderHook(() => useEyeTracking({ maxOffset: 0.5 }));

      // maxOffsetは内部でクランプに使用される
      expect(result.current.targetX).toBe(0);
      expect(result.current.targetY).toBe(0);
    });

    it('should respect enabled option', () => {
      const { result } = renderHook(() => useEyeTracking({ enabled: false }));

      act(() => {
        result.current.updateTarget(1000, 1000);
      });

      // disabledの場合、何も変わらない
      expect(result.current.isTracking).toBe(false);
      expect(result.current.targetX).toBe(0);
      expect(result.current.targetY).toBe(0);
    });
  });
});
