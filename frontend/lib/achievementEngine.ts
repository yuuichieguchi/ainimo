import {
  Achievement,
  AchievementState,
  AchievementStats,
  UnlockedAchievement,
} from '@/types/achievement';
import { ActionType, GameParameters } from '@/types/game';
import { getTodayDateString, getIntelligenceTier } from './gameEngine';
import { GAME_CONSTANTS } from './constants';

// 初期状態生成
export function getInitialAchievementState(): AchievementState {
  return {
    unlocked: [],
    stats: getInitialAchievementStats(),
    selectedTitleId: null,
    pendingNotifications: [],
  };
}

// 初期統計情報
export function getInitialAchievementStats(): AchievementStats {
  return {
    talkCount: 0,
    studyCount: 0,
    playCount: 0,
    restCount: 0,
    totalActions: 0,
    messagesSent: 0,
    currentLoginStreak: 0,
    maxLoginStreak: 0,
    totalPlayDays: 0,
    lastPlayDate: '',
    restLimitHitDays: 0,
    todayActions: [],
    todayActionsDate: getTodayDateString(),
  };
}

// 統計情報の更新（アクション実行時）
export function updateAchievementStats(
  currentStats: AchievementStats,
  action: ActionType
): AchievementStats {
  const today = getTodayDateString();

  // 日付が変わったらtodayActionsをリセット
  const todayActions = currentStats.todayActionsDate === today
    ? [...currentStats.todayActions]
    : [];

  // 今日のアクションに追加（重複なし）
  if (!todayActions.includes(action)) {
    todayActions.push(action);
  }

  const updated: AchievementStats = {
    ...currentStats,
    totalActions: currentStats.totalActions + 1,
    todayActions,
    todayActionsDate: today,
  };

  // アクション別カウント
  switch (action) {
    case 'talk':
      updated.talkCount = currentStats.talkCount + 1;
      break;
    case 'study':
      updated.studyCount = currentStats.studyCount + 1;
      break;
    case 'play':
      updated.playCount = currentStats.playCount + 1;
      break;
    case 'rest':
      updated.restCount = currentStats.restCount + 1;
      break;
  }

  return updated;
}

// メッセージ送信時の統計更新
export function updateMessageStats(currentStats: AchievementStats): AchievementStats {
  return {
    ...currentStats,
    messagesSent: currentStats.messagesSent + 1,
  };
}

// 休憩上限到達時の統計更新
export function updateRestLimitHitStats(currentStats: AchievementStats): AchievementStats {
  return {
    ...currentStats,
    restLimitHitDays: currentStats.restLimitHitDays + 1,
  };
}

// ログインストリーク更新
export function updateLoginStreak(currentStats: AchievementStats): AchievementStats {
  const today = getTodayDateString();

  // 同じ日なら何もしない
  if (currentStats.lastPlayDate === today) {
    return currentStats;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let newStreak: number;
  if (currentStats.lastPlayDate === yesterdayStr) {
    // 連続日
    newStreak = currentStats.currentLoginStreak + 1;
  } else {
    // 連続が途切れた
    newStreak = 1;
  }

  const newMaxStreak = Math.max(currentStats.maxLoginStreak, newStreak);

  return {
    ...currentStats,
    currentLoginStreak: newStreak,
    maxLoginStreak: newMaxStreak,
    totalPlayDays: currentStats.totalPlayDays + 1,
    lastPlayDate: today,
  };
}

// 単一実績の条件チェック
export function checkAchievementCondition(
  achievement: Achievement,
  stats: AchievementStats,
  parameters: GameParameters
): boolean {
  const condition = achievement.condition;

  switch (condition.type) {
    case 'action_count': {
      const count = getActionCount(stats, condition.action);
      return count >= condition.count;
    }

    case 'total_actions':
      return stats.totalActions >= condition.count;

    case 'stat_reach':
      return parameters[condition.stat] >= condition.value;

    case 'stat_max':
      return parameters[condition.stat] >= GAME_CONSTANTS.MAX_STAT;

    case 'all_stats_reach': {
      const relevantStats: (keyof GameParameters)[] = ['intelligence', 'memory', 'friendliness', 'energy'];
      return relevantStats.every(stat => parameters[stat] >= condition.value);
    }

    case 'level_reach':
      return parameters.level >= condition.level;

    case 'tier_reach': {
      const currentTier = getIntelligenceTier(parameters.intelligence);
      const tierOrder = ['baby', 'child', 'teen', 'adult'] as const;
      const currentIndex = tierOrder.indexOf(currentTier);
      const targetIndex = tierOrder.indexOf(condition.tier);
      return currentIndex >= targetIndex;
    }

    case 'message_count':
      return stats.messagesSent >= condition.count;

    case 'login_streak':
      return stats.currentLoginStreak >= condition.days;

    case 'play_days':
      return stats.totalPlayDays >= condition.days;

    case 'achievement_count':
      // この条件は特別処理が必要（unlocked配列が必要）
      return false;

    case 'rest_limit_hit':
      return stats.restLimitHitDays >= condition.days;

    case 'time_of_day': {
      const hour = new Date().getHours();
      return hour >= condition.startHour && hour <= condition.endHour;
    }

    case 'all_actions_in_day': {
      const allActions: ActionType[] = ['talk', 'study', 'play', 'rest'];
      return allActions.every(action => stats.todayActions.includes(action));
    }

    case 'all_achievements':
      // この条件は特別処理が必要
      return false;

    default:
      return false;
  }
}

// アクション別カウント取得
function getActionCount(stats: AchievementStats, action: ActionType): number {
  switch (action) {
    case 'talk': return stats.talkCount;
    case 'study': return stats.studyCount;
    case 'play': return stats.playCount;
    case 'rest': return stats.restCount;
    default: return 0;
  }
}

// 新規解除実績の検出
export function detectNewUnlocks(
  allAchievements: Achievement[],
  currentState: AchievementState,
  parameters: GameParameters
): string[] {
  const newUnlocks: string[] = [];
  const unlockedCount = currentState.unlocked.length;

  for (const achievement of allAchievements) {
    // 既に解除済みならスキップ
    if (isUnlocked(achievement.id, currentState.unlocked)) {
      continue;
    }

    // 特別な条件のチェック
    if (achievement.condition.type === 'achievement_count') {
      if (unlockedCount + newUnlocks.length >= achievement.condition.count) {
        newUnlocks.push(achievement.id);
      }
      continue;
    }

    if (achievement.condition.type === 'all_achievements') {
      // 全実績解除は最後にチェック（自身を除く全実績が解除されている必要がある）
      const nonCollectAchievements = allAchievements.filter(a => a.id !== achievement.id);
      const allUnlocked = nonCollectAchievements.every(a =>
        isUnlocked(a.id, currentState.unlocked) || newUnlocks.includes(a.id)
      );
      if (allUnlocked) {
        newUnlocks.push(achievement.id);
      }
      continue;
    }

    // 通常の条件チェック
    if (checkAchievementCondition(achievement, currentState.stats, parameters)) {
      newUnlocks.push(achievement.id);
    }
  }

  return newUnlocks;
}

// 実績解除処理
export function unlockAchievements(
  state: AchievementState,
  achievementIds: string[]
): AchievementState {
  if (achievementIds.length === 0) {
    return state;
  }

  const now = Date.now();
  const newUnlocked: UnlockedAchievement[] = achievementIds.map(id => ({
    id,
    unlockedAt: now,
  }));

  return {
    ...state,
    unlocked: [...state.unlocked, ...newUnlocked],
    pendingNotifications: [...state.pendingNotifications, ...achievementIds],
  };
}

// 通知消化処理
export function consumeNotification(
  state: AchievementState
): { state: AchievementState; achievementId: string | null } {
  if (state.pendingNotifications.length === 0) {
    return { state, achievementId: null };
  }

  const [achievementId, ...remaining] = state.pendingNotifications;

  return {
    state: {
      ...state,
      pendingNotifications: remaining,
    },
    achievementId,
  };
}

// タイトル選択
export function selectTitle(
  state: AchievementState,
  titleId: string | null
): AchievementState {
  return {
    ...state,
    selectedTitleId: titleId,
  };
}

// 解除済み判定
export function isUnlocked(
  achievementId: string,
  unlocked: UnlockedAchievement[]
): boolean {
  return unlocked.some(u => u.id === achievementId);
}

// 進捗率計算（0-100）
export function calculateProgress(
  achievement: Achievement,
  stats: AchievementStats,
  parameters: GameParameters
): number {
  const condition = achievement.condition;

  let current: number;
  let target: number;

  switch (condition.type) {
    case 'action_count':
      current = getActionCount(stats, condition.action);
      target = condition.count;
      break;

    case 'total_actions':
      current = stats.totalActions;
      target = condition.count;
      break;

    case 'stat_reach':
      current = parameters[condition.stat];
      target = condition.value;
      break;

    case 'stat_max':
      current = parameters[condition.stat];
      target = GAME_CONSTANTS.MAX_STAT;
      break;

    case 'level_reach':
      current = parameters.level;
      target = condition.level;
      break;

    case 'message_count':
      current = stats.messagesSent;
      target = condition.count;
      break;

    case 'login_streak':
      current = stats.currentLoginStreak;
      target = condition.days;
      break;

    case 'play_days':
      current = stats.totalPlayDays;
      target = condition.days;
      break;

    case 'achievement_count':
      current = 0; // 外部から設定が必要
      target = condition.count;
      break;

    case 'rest_limit_hit':
      current = stats.restLimitHitDays;
      target = condition.days;
      break;

    case 'all_stats_reach': {
      const relevantStats: (keyof GameParameters)[] = ['intelligence', 'memory', 'friendliness', 'energy'];
      const values = relevantStats.map(stat => parameters[stat]);
      const minValue = Math.min(...values);
      current = minValue;
      target = condition.value;
      break;
    }

    default:
      return 0;
  }

  if (target === 0) return 100;
  return Math.min(100, Math.round((current / target) * 100));
}
