import { GameState, GameParameters, ActionType, IntelligenceTier, MoodType, RestLimitState } from '@/types/game';
import { GAME_CONSTANTS, ACTION_EFFECTS, INTELLIGENCE_THRESHOLDS } from './constants';
import { getInitialAchievementState } from './achievementEngine';

// 今日の日付をYYYY-MM-DD形式で取得（ローカルタイム基準）
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
    restLimit: {
      count: 0,
      lastResetDate: getTodayDateString(),
    },
    achievements: getInitialAchievementState(),
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

// 今日の残り休憩回数を取得
export function getRemainingRestCount(restLimit: RestLimitState): number {
  const currentDate = getTodayDateString();
  const effectiveCount = restLimit.lastResetDate === currentDate ? restLimit.count : 0;
  return GAME_CONSTANTS.MAX_REST_PER_DAY - effectiveCount;
}

// 休憩回数を更新（日付リセット含む）
export function updateRestLimit(restLimit: RestLimitState): RestLimitState {
  const currentDate = getTodayDateString();

  if (restLimit.lastResetDate !== currentDate) {
    // 日付が変わっていたらリセットして1回目
    return { count: 1, lastResetDate: currentDate };
  }

  return {
    count: restLimit.count + 1,
    lastResetDate: currentDate
  };
}

export function canPerformAction(
  parameters: GameParameters,
  action: ActionType,
  restLimit?: RestLimitState
): boolean {
  if (action === 'rest') {
    if (!restLimit) return true;
    return getRemainingRestCount(restLimit) > 0;
  }
  return parameters.energy >= GAME_CONSTANTS.ENERGY_THRESHOLD;
}

export function processAction(
  state: GameState,
  action: ActionType
): GameState {
  if (!canPerformAction(state.parameters, action, state.restLimit)) {
    return state;
  }

  const newParameters = updateParameters(state.parameters, action);

  // 休憩の場合は restLimit を更新
  const newRestLimit = action === 'rest'
    ? updateRestLimit(state.restLimit)
    : state.restLimit;

  return {
    ...state,
    parameters: newParameters,
    lastActionTime: Date.now(),
    restLimit: newRestLimit,
  };
}

export function applyPassiveDecay(state: GameState): GameState {
  const now = Date.now();
  const minutesSinceLastAction = (now - state.lastActionTime) / (1000 * 60);

  // 30分未満は何もしない
  if (minutesSinceLastAction < GAME_CONSTANTS.DECAY_THRESHOLD_MINUTES) {
    return state;
  }

  // 30分ごとに -1 (上限 -50)
  const intervals = Math.floor(minutesSinceLastAction / GAME_CONSTANTS.DECAY_THRESHOLD_MINUTES);
  const decayAmount = Math.min(
    GAME_CONSTANTS.DECAY_MAX_PENALTY,
    intervals * GAME_CONSTANTS.DECAY_PENALTY_PER_INTERVAL
  );

  const newParameters: GameParameters = {
    ...state.parameters,
    // energy は減らさない（friendlinessのみ）
    friendliness: clampStat(state.parameters.friendliness - decayAmount),
  };

  newParameters.mood = calculateMood(newParameters);

  return {
    ...state,
    parameters: newParameters,
  };
}
