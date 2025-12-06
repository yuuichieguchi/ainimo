'use client';

import { useEffect, useCallback, useRef } from 'react';
import { GameState } from '@/types/game';
import { saveGameState, loadGameState, clearGameState } from '@/lib/storage';

export function usePersistence(
  state: GameState,
  onLoad?: (loadedState: GameState) => void
) {
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadGameState()
        .then((loadedState) => {
          if (loadedState && onLoad) {
            onLoad(loadedState);
          }
        })
        .catch((error) => {
          console.error('Failed to load game state:', error);
        });
    }
  }, [onLoad]);

  useEffect(() => {
    if (!isInitialLoad.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveGameState(state).catch((error) => {
          console.error('Failed to save game state:', error);
        });
      }, 500);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  const clearSave = useCallback(async () => {
    try {
      await clearGameState();
    } catch (error) {
      console.error('Failed to clear game state:', error);
    }
  }, []);

  return { clearSave };
}
