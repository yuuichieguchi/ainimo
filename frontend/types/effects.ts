// エフェクトシステムの型定義

// パーティクルタイプ
export type ParticleType =
  | 'sparkle'    // キラキラ（勉強時）
  | 'star'       // 星（遊び時）
  | 'note'       // 音符（遊び時）
  | 'heart'      // ハート（タップ時）
  | 'petal'      // 桜の花びら（春）
  | 'leaf'       // 紅葉（秋）
  | 'snowflake'  // 雪（冬）
  | 'raindrop';  // 雨粒

// エモートタイプ
export type EmoteType =
  | 'thought'     // 💭
  | 'music'       // 🎵
  | 'heart'       // ❤️
  | 'sleep'       // 💤
  | 'exclamation' // ❗
  | 'question'    // ❓
  | 'happy'       // 😊
  | 'sparkle';    // ✨

// 天気タイプ
export type WeatherType = 'sunny' | 'rainy' | 'snowy' | 'cloudy';

// 季節タイプ
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

// 時間帯タイプ
export type TimeOfDayType = 'dawn' | 'day' | 'dusk' | 'night';

// パーティクルの状態
export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;        // X方向の速度
  vy: number;        // Y方向の速度
  life: number;      // 残り寿命
  maxLife: number;   // 最大寿命
  size: number;      // サイズ
  rotation: number;  // 回転角度
  opacity: number;   // 透明度
}

// パーティクル生成オプション
export interface ParticleEmitOptions {
  type: ParticleType;
  x: number;
  y: number;
  count: number;
  spread?: number;        // 拡散範囲
  velocity?: number;      // 初速
  gravity?: number;       // 重力
  lifespan?: number;      // 寿命
  size?: number;          // サイズ
}

// エモート表示オプション
export interface EmoteOptions {
  type: EmoteType;
  duration?: number;      // 表示時間（ms）
  position?: 'top' | 'right' | 'left';
}

// インタラクション状態
export interface InteractionState {
  isPressed: boolean;
  isDragging: boolean;
  isPetting: boolean;     // 長押し中
  pointerPosition: { x: number; y: number } | null;
  tapCount: number;       // 連続タップ回数
}

// 浮遊数値エフェクト
export interface FloatingValueEffect {
  id: string;
  value: number;
  stat: string;
  x: number;
  y: number;
  createdAt: number;
}

// エフェクトコンテキストの状態
export interface EffectsContextState {
  timeOfDay: TimeOfDayType;
  weather: WeatherType;
  season: SeasonType;
  activeEmote: EmoteType | null;
  isBeingPetted: boolean;
  floatingValues: FloatingValueEffect[];
}

// エフェクトコンテキストのアクション
export interface EffectsContextActions {
  setWeather: (weather: WeatherType) => void;
  showEmote: (emote: EmoteType, duration?: number) => void;
  hideEmote: () => void;
  addFloatingValue: (stat: string, value: number, x: number, y: number) => void;
  setBeingPetted: (isPetted: boolean) => void;
}

// エフェクトコンテキストの完全な型
export type EffectsContext = EffectsContextState & EffectsContextActions;

// 目線追従の状態
export interface EyeTrackingState {
  targetX: number;  // -1 to 1 (左から右)
  targetY: number;  // -1 to 1 (上から下)
  isTracking: boolean;
}

// 成長アニメーションの状態
export interface GrowthAnimationState {
  isAnimating: boolean;
  previousTier: string | null;
  currentTier: string;
}

// パーティクルの絵文字マッピング
export const PARTICLE_EMOJI: Record<ParticleType, string> = {
  sparkle: '✨',
  star: '⭐',
  note: '🎵',
  heart: '❤️',
  petal: '🌸',
  leaf: '🍂',
  snowflake: '❄️',
  raindrop: '💧',
};

// エモートの絵文字マッピング
export const EMOTE_EMOJI: Record<EmoteType, string> = {
  thought: '💭',
  music: '🎵',
  heart: '❤️',
  sleep: '💤',
  exclamation: '❗',
  question: '❓',
  happy: '😊',
  sparkle: '✨',
};

// 時間帯の背景グラデーション
export const TIME_OF_DAY_GRADIENTS: Record<TimeOfDayType, { from: string; to: string }> = {
  dawn: { from: '#ffecd2', to: '#fcb69f' },
  day: { from: '#a1c4fd', to: '#c2e9fb' },
  dusk: { from: '#fa709a', to: '#fee140' },
  night: { from: '#0c1445', to: '#1a1a2e' },
};

// 季節の装飾設定
export const SEASON_CONFIG: Record<SeasonType, { particleType: ParticleType; color: string }> = {
  spring: { particleType: 'petal', color: '#ffb7c5' },
  summer: { particleType: 'sparkle', color: '#ffd700' },
  autumn: { particleType: 'leaf', color: '#ff6b35' },
  winter: { particleType: 'snowflake', color: '#ffffff' },
};
