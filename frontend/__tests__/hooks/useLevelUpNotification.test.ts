import { renderHook, act } from '@testing-library/react';
import { useLevelUpNotification } from '@/hooks/useLevelUpNotification';

// タイマーをモック化
jest.useFakeTimers();

// localStorageをモック化
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLevelUpNotification', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should initialize with notification hidden on first visit (no localStorage)', () => {
    const { result } = renderHook(() => useLevelUpNotification(1));

    expect(result.current.notificationState.isVisible).toBe(false);
    expect(result.current.notificationState.newLevel).toBe(1);
    expect(result.current.isLevelUpRecent).toBe(false);
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('1');
  });

  it('should not show notification on mount when localStorage has same level', () => {
    // 既に同じレベルで通知済み
    localStorageMock.setItem('ainimo_last_notified_level', '3');

    const { result } = renderHook(() => useLevelUpNotification(3));

    expect(result.current.notificationState.isVisible).toBe(false);
    expect(result.current.notificationState.newLevel).toBe(3);
    expect(result.current.isLevelUpRecent).toBe(false);
  });

  it('should not show notification on mount when localStorage has higher level', () => {
    // localStorageの方が高いレベル（通常発生しないが念のため）
    localStorageMock.setItem('ainimo_last_notified_level', '5');

    const { result } = renderHook(() => useLevelUpNotification(3));

    expect(result.current.notificationState.isVisible).toBe(false);
  });

  it('should show notification when level increases from rerender', () => {
    // 初回マウント時にlevel=1でlocalStorageに保存される
    const { result, rerender } = renderHook(
      ({ level }) => useLevelUpNotification(level),
      { initialProps: { level: 1 } }
    );

    // localStorageに保存されていることを確認
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('1');

    // レベルアップ
    act(() => {
      rerender({ level: 2 });
    });

    expect(result.current.notificationState.isVisible).toBe(true);
    expect(result.current.notificationState.newLevel).toBe(2);
    expect(result.current.isLevelUpRecent).toBe(true);
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('2');
  });

  it('should show notification on mount when localStorage has lower level', () => {
    // 前回level=2で通知済み
    localStorageMock.setItem('ainimo_last_notified_level', '2');

    // level=3でマウント（レベルアップしている）
    const { result } = renderHook(() => useLevelUpNotification(3));

    expect(result.current.notificationState.isVisible).toBe(true);
    expect(result.current.notificationState.newLevel).toBe(3);
    expect(result.current.isLevelUpRecent).toBe(true);
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('3');
  });

  it('should not show notification when level decreases', () => {
    // 初回マウント時にlevel=5でlocalStorageに保存される
    const { result, rerender } = renderHook(
      ({ level }) => useLevelUpNotification(level),
      { initialProps: { level: 5 } }
    );

    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('5');

    // レベルダウン（リセット時など）
    act(() => {
      rerender({ level: 1 });
    });

    expect(result.current.notificationState.isVisible).toBe(false);
    // localStorageは更新されない（level > lastLevelの条件を満たさないため）
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('5');
  });

  it('should not show notification when level stays the same', () => {
    // 初回マウント時にlevel=3でlocalStorageに保存される
    const { result, rerender } = renderHook(
      ({ level }) => useLevelUpNotification(level),
      { initialProps: { level: 3 } }
    );

    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('3');

    act(() => {
      rerender({ level: 3 });
    });

    expect(result.current.notificationState.isVisible).toBe(false);
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('3');
  });

  it('should hide notification after 2.5 seconds', () => {
    // 初回マウント時にlevel=1でlocalStorageに保存される
    const { result, rerender } = renderHook(
      ({ level }) => useLevelUpNotification(level),
      { initialProps: { level: 1 } }
    );

    // レベルアップ
    act(() => {
      rerender({ level: 2 });
    });

    expect(result.current.notificationState.isVisible).toBe(true);

    // 2.5秒経過
    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(result.current.notificationState.isVisible).toBe(false);
  });

  it('should clear isLevelUpRecent flag after 3 seconds', () => {
    // 初回マウント時にlevel=1でlocalStorageに保存される
    const { result, rerender } = renderHook(
      ({ level }) => useLevelUpNotification(level),
      { initialProps: { level: 1 } }
    );

    // レベルアップ
    act(() => {
      rerender({ level: 2 });
    });

    expect(result.current.isLevelUpRecent).toBe(true);

    // 3秒経過
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.isLevelUpRecent).toBe(false);
  });

  it('should manually hide notification when hideNotification is called', () => {
    // 初回マウント時にlevel=1でlocalStorageに保存される
    const { result, rerender } = renderHook(
      ({ level }) => useLevelUpNotification(level),
      { initialProps: { level: 1 } }
    );

    // レベルアップ
    act(() => {
      rerender({ level: 2 });
    });

    expect(result.current.notificationState.isVisible).toBe(true);

    // 手動で閉じる
    act(() => {
      result.current.hideNotification();
    });

    expect(result.current.notificationState.isVisible).toBe(false);
  });

  it('should handle multiple level ups correctly', () => {
    // 初回マウント時にlevel=1でlocalStorageに保存される
    const { result, rerender } = renderHook(
      ({ level }) => useLevelUpNotification(level),
      { initialProps: { level: 1 } }
    );

    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('1');

    // 最初のレベルアップ
    act(() => {
      rerender({ level: 2 });
    });

    expect(result.current.notificationState.newLevel).toBe(2);
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('2');

    // タイマーを進めて通知を閉じる
    act(() => {
      jest.advanceTimersByTime(2500);
    });

    // 次のレベルアップ
    act(() => {
      rerender({ level: 3 });
    });

    expect(result.current.notificationState.isVisible).toBe(true);
    expect(result.current.notificationState.newLevel).toBe(3);
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('3');
  });

  it('should cleanup timers on unmount', () => {
    // 初回マウント時にlevel=1でlocalStorageに保存される
    const { result, rerender, unmount } = renderHook(
      ({ level }) => useLevelUpNotification(level),
      { initialProps: { level: 1 } }
    );

    // レベルアップ
    act(() => {
      rerender({ level: 2 });
    });

    // アンマウント
    unmount();

    // タイマーが進んでもエラーが出ないことを確認
    expect(() => {
      jest.advanceTimersByTime(3000);
    }).not.toThrow();
  });

  it('should simulate page reload with same level (no notification)', () => {
    // ユーザーがlevel=5に到達して通知を受け取った
    localStorageMock.setItem('ainimo_last_notified_level', '5');

    // ページをリロード（新しいフックインスタンスを作成）
    const { result: result1, unmount: unmount1 } = renderHook(() =>
      useLevelUpNotification(5)
    );

    // リロード時は通知が表示されない
    expect(result1.current.notificationState.isVisible).toBe(false);
    expect(result1.current.isLevelUpRecent).toBe(false);

    unmount1();

    // 再度ページをリロード
    const { result: result2 } = renderHook(() =>
      useLevelUpNotification(5)
    );

    // 何度リロードしても通知は表示されない
    expect(result2.current.notificationState.isVisible).toBe(false);
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('5');
  });

  it('should show notification after page reload with higher level', () => {
    // ユーザーがlevel=3で通知を受け取った
    localStorageMock.setItem('ainimo_last_notified_level', '3');

    // その後レベルアップしてlevel=4になった状態でページをリロード
    const { result } = renderHook(() => useLevelUpNotification(4));

    // 新しいレベルで通知が表示される
    expect(result.current.notificationState.isVisible).toBe(true);
    expect(result.current.notificationState.newLevel).toBe(4);
    expect(result.current.isLevelUpRecent).toBe(true);
    expect(localStorageMock.getItem('ainimo_last_notified_level')).toBe('4');
  });
});
