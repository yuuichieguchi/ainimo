import { ActionType, IntelligenceTier } from '@/types/game';
import { RESPONSE_TEMPLATES_EN } from './responseTemplates';

export const GAME_CONSTANTS = {
  XP_PER_LEVEL: 100,
  MAX_LEVEL: 100,
  MAX_STAT: 100,
  MIN_STAT: 0,
  ENERGY_THRESHOLD: 20,
  MAX_MESSAGES: 50,
  // 休憩制限
  MAX_REST_PER_DAY: 3,
  // 放置ペナルティ
  DECAY_THRESHOLD_MINUTES: 30,    // 30分で発動
  DECAY_PENALTY_PER_INTERVAL: 1,  // 30分ごとに -1
  DECAY_MAX_PENALTY: 50,          // 最大 -50
} as const;

export const ACTION_EFFECTS: Record<ActionType, { xp: number; intelligence: number; memory: number; friendliness: number; energy: number }> = {
  talk: { xp: 5, intelligence: 0, memory: 3, friendliness: 2, energy: -10 },
  study: { xp: 10, intelligence: 5, memory: 1, friendliness: 0, energy: -15 },
  play: { xp: 3, intelligence: 0, memory: 0, friendliness: 8, energy: -20 },
  rest: { xp: 0, intelligence: 0, memory: 0, friendliness: 0, energy: 50 },
} as const;

export const INTELLIGENCE_THRESHOLDS: Record<IntelligenceTier, number> = {
  baby: 0,
  child: 25,
  teen: 50,
  adult: 75,
} as const;

export const RESPONSE_TEMPLATES = RESPONSE_TEMPLATES_EN;
