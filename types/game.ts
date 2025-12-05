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

export interface GameState {
  parameters: GameParameters;
  messages: Message[];
  createdAt: number;
  lastActionTime: number;
}

export interface ActionEffect {
  xp: number;
  intelligence: number;
  memory: number;
  friendliness: number;
  energy: number;
}
