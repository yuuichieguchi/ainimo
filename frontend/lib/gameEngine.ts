import { GameState, GameParameters, ActionType, IntelligenceTier, MoodType } from '@/types/game';
import { GAME_CONSTANTS, ACTION_EFFECTS, INTELLIGENCE_THRESHOLDS } from './constants';

export function getInitialState(): GameState {
  return {
    parameters: {
      level: 1,
      xp: 0,
      intelligence: 10,
      memory: 5,
      friendliness: 50,
      energy: 100,
      mood: 60,
    },
    messages: [],
    createdAt: Date.now(),
    lastActionTime: Date.now(),
  };
}

export function clampStat(value: number): number {
  return Math.max(GAME_CONSTANTS.MIN_STAT, Math.min(GAME_CONSTANTS.MAX_STAT, value));
}

export function calculateXpGain(action: ActionType, intelligence: number): number {
  const baseXp = ACTION_EFFECTS[action].xp;
  const intelligenceBonus = Math.floor(intelligence / 20);
  return baseXp + intelligenceBonus;
}

export function checkLevelUp(xp: number, currentLevel: number): { level: number; xp: number } {
  if (xp >= GAME_CONSTANTS.XP_PER_LEVEL && currentLevel < GAME_CONSTANTS.MAX_LEVEL) {
    return {
      level: currentLevel + 1,
      xp: xp - GAME_CONSTANTS.XP_PER_LEVEL,
    };
  }
  return { level: currentLevel, xp };
}

export function getIntelligenceTier(intelligence: number): IntelligenceTier {
  if (intelligence >= INTELLIGENCE_THRESHOLDS.adult) return 'adult';
  if (intelligence >= INTELLIGENCE_THRESHOLDS.teen) return 'teen';
  if (intelligence >= INTELLIGENCE_THRESHOLDS.child) return 'child';
  return 'baby';
}

export function calculateMood(parameters: GameParameters): number {
  const { friendliness, energy, intelligence } = parameters;
  const moodValue = friendliness * 0.4 + energy * 0.3 + intelligence * 0.3;
  return clampStat(Math.round(moodValue));
}

export function getMoodType(mood: number): MoodType {
  if (mood >= 70) return 'happy';
  if (mood >= 40) return 'normal';
  if (mood >= 20) return 'tired';
  return 'sad';
}

export function updateParameters(
  current: GameParameters,
  action: ActionType
): GameParameters {
  const effects = ACTION_EFFECTS[action];
  const xpGain = calculateXpGain(action, current.intelligence);

  const newXp = current.xp + xpGain;
  const { level, xp } = checkLevelUp(newXp, current.level);

  const updated: GameParameters = {
    level,
    xp,
    intelligence: clampStat(current.intelligence + effects.intelligence),
    memory: clampStat(current.memory + effects.memory),
    friendliness: clampStat(current.friendliness + effects.friendliness),
    energy: clampStat(current.energy + effects.energy),
    mood: current.mood,
  };

  updated.mood = calculateMood(updated);

  return updated;
}

export function canPerformAction(parameters: GameParameters, action: ActionType): boolean {
  if (action === 'rest') return true;
  return parameters.energy >= GAME_CONSTANTS.ENERGY_THRESHOLD;
}

export function processAction(
  state: GameState,
  action: ActionType
): GameState {
  if (!canPerformAction(state.parameters, action)) {
    return state;
  }

  const newParameters = updateParameters(state.parameters, action);

  return {
    ...state,
    parameters: newParameters,
    lastActionTime: Date.now(),
  };
}

export function applyPassiveDecay(state: GameState): GameState {
  const now = Date.now();
  const hoursSinceLastAction = (now - state.lastActionTime) / (1000 * 60 * 60);

  if (hoursSinceLastAction < 1) {
    return state;
  }

  const decayAmount = Math.min(20, Math.floor(hoursSinceLastAction));

  const newParameters: GameParameters = {
    ...state.parameters,
    energy: clampStat(state.parameters.energy - decayAmount),
    friendliness: clampStat(state.parameters.friendliness - decayAmount),
  };

  newParameters.mood = calculateMood(newParameters);

  return {
    ...state,
    parameters: newParameters,
  };
}
