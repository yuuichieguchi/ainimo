import { AchievementState } from './achievement';
import { PersonalityData } from './personality';

export type ActionType = 'talk' | 'study' | 'play' | 'rest';

export type MoodType = 'happy' | 'normal' | 'tired' | 'sad';

export type IntelligenceTier = 'baby' | 'child' | 'teen' | 'adult';

export interface GameParameters {
  level: number;
  xp: number;
  intelligence: number;
  memory: number;
  friendliness: number;
  energy: number;
  mood: number;
}

export interface Message {
  id: string;
  speaker: 'user' | 'ainimo';
  text: string;
  timestamp: number;
}

// 休憩制限の状態
export interface RestLimitState {
  count: number;          // 今日の休憩使用回数 (0-3)
  lastResetDate: string;  // 最後にリセットした日付 (YYYY-MM-DD形式)
}

export interface GameState {
  parameters: GameParameters;
  messages: Message[];
  createdAt: number;
  lastActionTime: number;
  currentActivity?: ActionType | null;
  restLimit: RestLimitState;
  achievements?: AchievementState;
  personality?: PersonalityData;
}

export interface ActionEffect {
  xp: number;
  intelligence: number;
  memory: number;
  friendliness: number;
  energy: number;
}
