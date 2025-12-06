'use client';

import { useState, useCallback } from 'react';
import { GameState, ActionType, Message } from '@/types/game';
import { getInitialState, processAction, getIntelligenceTier, applyPassiveDecay } from '@/lib/gameEngine';
import { generateResponse } from '@/lib/responseEngine';
import { GAME_CONSTANTS } from '@/lib/constants';
import { sanitizeUserInput } from '@/lib/validation';
import { Language } from './useLanguage';

export function useGameState(initialState?: GameState) {
  const [state, setState] = useState<GameState>(initialState || getInitialState());

  const handleAction = useCallback((action: ActionType) => {
    setState((prevState) => {
      const decayedState = applyPassiveDecay(prevState);
      return processAction(decayedState, action);
    });
  }, []);

  const handleChat = useCallback((userInput: string, language: Language) => {
    setState((prevState) => {
      const decayedState = applyPassiveDecay(prevState);

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
        language
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

      const talkState = processAction(decayedState, 'talk');

      return {
        ...talkState,
        messages: trimmedMessages,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(getInitialState());
  }, []);

  const loadState = useCallback((loadedState: GameState) => {
    setState(loadedState);
  }, []);

  return {
    state,
    handleAction,
    handleChat,
    resetGame,
    loadState,
  };
}
