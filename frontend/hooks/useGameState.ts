'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, ActionType, Message, GameParameters } from '@/types/game';
import { AchievementState } from '@/types/achievement';
import { PersonalityData } from '@/types/personality';
import { MiniGameState } from '@/types/miniGame';
import { PlayerInventory } from '@/types/item';
import { getInitialState, processAction, getIntelligenceTier, applyPassiveDecay } from '@/lib/gameEngine';
import { generateResponse } from '@/lib/responseEngine';
import { GAME_CONSTANTS } from '@/lib/constants';
import { sanitizeUserInput } from '@/lib/validation';
import {
  processPersonalityAction,
  computePersonalityState,
  getInitialPersonalityData,
} from '@/lib/personalityEngine';
import { Language } from './useLanguage';

export function useGameState(initialState?: GameState) {
  const [state, setState] = useState<GameState>(initialState || getInitialState());
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!state.currentActivity) return;

    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    activityTimerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, currentActivity: null }));
    }, 3000);

    return () => {
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [state.currentActivity]);

  const handleAction = useCallback((action: ActionType): GameParameters | null => {
    let newParameters: GameParameters | null = null;

    setState((prevState) => {
      const decayedState = applyPassiveDecay(prevState);

      // 性格データを更新
      const currentPersonality = decayedState.personality || getInitialPersonalityData();
      const newPersonalityData = processPersonalityAction(currentPersonality, action);
      const personalityState = computePersonalityState(newPersonalityData);

      // 性格状態を適用してアクションを処理
      const newState = processAction(decayedState, action, personalityState);

      // アクションが実行された場合のみcurrentActivityをセット
      const actionExecuted = newState !== decayedState;

      if (actionExecuted) {
        newParameters = newState.parameters;
      }

      if (actionExecuted && (action === 'study' || action === 'play' || action === 'rest')) {
        return {
          ...newState,
          currentActivity: action,
          personality: newPersonalityData,
        };
      }

      return {
        ...newState,
        personality: newPersonalityData,
      };
    });

    return newParameters;
  }, []);

  const handleChat = useCallback((userInput: string, language: Language) => {
    setState((prevState) => {
      const decayedState = applyPassiveDecay(prevState);

      // 性格データを更新 (talk action)
      const currentPersonality = decayedState.personality || getInitialPersonalityData();
      const newPersonalityData = processPersonalityAction(currentPersonality, 'talk');
      const personalityState = computePersonalityState(newPersonalityData);

      const sanitizedInput = sanitizeUserInput(userInput);

      const userMessage: Message = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        speaker: 'user',
        text: sanitizedInput,
        timestamp: Date.now(),
      };

      const tier = getIntelligenceTier(decayedState.parameters.intelligence);
      const recentMessages = decayedState.messages.slice(-5);

      const response = generateResponse(
        sanitizedInput,
        tier,
        decayedState.parameters.mood,
        decayedState.parameters.memory,
        recentMessages,
        language,
        personalityState
      );

      const ainimoMessage: Message = {
        id: `ainimo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        speaker: 'ainimo',
        text: response,
        timestamp: Date.now() + 1,
      };

      const updatedMessages = [...decayedState.messages, userMessage, ainimoMessage];
      const trimmedMessages =
        updatedMessages.length > GAME_CONSTANTS.MAX_MESSAGES
          ? updatedMessages.slice(-GAME_CONSTANTS.MAX_MESSAGES)
          : updatedMessages;

      const talkState = processAction(decayedState, 'talk', personalityState);

      return {
        ...talkState,
        messages: trimmedMessages,
        personality: newPersonalityData,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(getInitialState());
  }, []);

  const loadState = useCallback((loadedState: GameState) => {
    setState(loadedState);
  }, []);

  // 実績状態を更新（永続化用）
  const updateAchievements = useCallback((achievements: AchievementState) => {
    setState(prevState => ({
      ...prevState,
      achievements,
    }));
  }, []);

  // 性格データを更新（永続化用）
  const updatePersonality = useCallback((personality: PersonalityData) => {
    setState(prevState => ({
      ...prevState,
      personality,
    }));
  }, []);

  // ミニゲーム状態を更新（永続化用）
  const updateMiniGames = useCallback((miniGames: MiniGameState) => {
    setState(prevState => ({
      ...prevState,
      miniGames,
    }));
  }, []);

  // インベントリを更新（永続化用）
  const updateInventory = useCallback((inventory: PlayerInventory) => {
    setState(prevState => ({
      ...prevState,
      inventory,
    }));
  }, []);

  // エネルギーを消費
  const spendEnergy = useCallback((amount: number) => {
    setState(prevState => ({
      ...prevState,
      parameters: {
        ...prevState.parameters,
        energy: Math.max(0, prevState.parameters.energy - amount),
      },
    }));
  }, []);

  // XPを追加
  const addXp = useCallback((amount: number) => {
    setState(prevState => {
      const newXp = prevState.parameters.xp + amount;
      const xpToNextLevel = prevState.parameters.level * 100;

      if (newXp >= xpToNextLevel) {
        return {
          ...prevState,
          parameters: {
            ...prevState.parameters,
            xp: newXp - xpToNextLevel,
            level: prevState.parameters.level + 1,
          },
        };
      }

      return {
        ...prevState,
        parameters: {
          ...prevState.parameters,
          xp: newXp,
        },
      };
    });
  }, []);

  return {
    state,
    handleAction,
    handleChat,
    resetGame,
    loadState,
    updateAchievements,
    updatePersonality,
    updateMiniGames,
    updateInventory,
    spendEnergy,
    addXp,
  };
}
