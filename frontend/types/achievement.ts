import { ActionType, IntelligenceTier, GameParameters } from './game';

// 実績カテゴリ
export type AchievementCategory =
  | 'action'      // アクション系
  | 'stats'       // ステータス系
  | 'milestone'   // マイルストーン系
  | 'streak'      // 連続系
  | 'collection'  // コレクション系
  | 'secret';     // シークレット系

// 実績レアリティ
export type AchievementRarity =
  | 'common'      // 一般
  | 'uncommon'    // 珍しい
  | 'rare'        // レア
  | 'epic'        // エピック
  | 'legendary';  // レジェンダリー

// バイリンガル対応テキスト
export interface BilingualText {
  en: string;
  ja: string;
}

// 実績解除条件の種類
export type AchievementCondition =
  | { type: 'action_count'; action: ActionType; count: number }
  | { type: 'total_actions'; count: number }
  | { type: 'stat_reach'; stat: keyof GameParameters; value: number }
  | { type: 'stat_max'; stat: keyof GameParameters }
  | { type: 'all_stats_reach'; value: number }
  | { type: 'level_reach'; level: number }
  | { type: 'tier_reach'; tier: IntelligenceTier }
  | { type: 'message_count'; count: number }
  | { type: 'login_streak'; days: number }
  | { type: 'play_days'; days: number }
  | { type: 'achievement_count'; count: number }
  | { type: 'rest_limit_hit'; days: number }
  | { type: 'time_of_day'; startHour: number; endHour: number }
  | { type: 'all_actions_in_day' }
  | { type: 'all_achievements' };

// 実績定義（マスタデータ）
export interface Achievement {
  id: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  isSecret: boolean;
  icon: string;
  name: BilingualText;
  description: BilingualText;
  title: BilingualText;
  condition: AchievementCondition;
}

// 解除済み実績
export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;  // timestamp
}

// 実績用統計情報
export interface AchievementStats {
  // アクション回数
  talkCount: number;
  studyCount: number;
  playCount: number;
  restCount: number;
  totalActions: number;

  // メッセージ数
  messagesSent: number;

  // 連続・累計日数
  currentLoginStreak: number;
  maxLoginStreak: number;
  totalPlayDays: number;
  lastPlayDate: string;  // YYYY-MM-DD形式

  // 特殊条件
  restLimitHitDays: number;       // 休憩上限に達した日数
  todayActions: ActionType[];     // 今日実行したアクションの種類
  todayActionsDate: string;       // todayActionsの日付
}

// 実績状態（GameStateに統合）
export interface AchievementState {
  unlocked: UnlockedAchievement[];
  stats: AchievementStats;
  selectedTitleId: string | null;
  pendingNotifications: string[];  // 表示待ちの実績ID
}
